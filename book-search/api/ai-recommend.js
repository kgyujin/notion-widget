import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query, config } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const ALADIN_TTBKEY = process.env.ALADIN_TTBKEY;

    // Debug logging
    console.log("Checking Env Vars:", {
        hasGemini: !!GEMINI_API_KEY,
        hasAladin: !!ALADIN_TTBKEY
    });

    if (!GEMINI_API_KEY || !ALADIN_TTBKEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Keys. Check Vercel Env Vars or .env file.' });
    }

    if (!config) {
        return res.status(400).json({ error: 'Client configuration (Notion Token/DB ID) is missing.' });
    }

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // 'gemini-pro' deprecated/not found. Using 'gemini-1.5-flash' for better speed and availability.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Recommend 5 books based on this request: "${query}".
        Return ONLY a JSON array of objects. No markdown, no extra text.
        Format: [{"title": "Book Title", "author": "Author Name"}]
        Language: Korean.
        If the request is vague, recommend popular high-rated books.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        let recommendations = [];
        try {
            recommendations = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Gemini Parse Error", e, responseText);
            return res.status(500).json({ error: "AI failed to generate valid recommendations." });
        }

        const notion = new Client({ auth: config.notionToken });
        const { databaseId, propertyMap } = config;

        const checkNotion = async (title, author) => {
            try {
                const response = await notion.databases.query({
                    database_id: databaseId,
                    filter: {
                        property: propertyMap.title,
                        title: { contains: title.split(' ')[0] }
                    }
                });

                const found = response.results.find(page => {
                    const pTitle = page.properties[propertyMap.title]?.title?.[0]?.plain_text || "";
                    return pTitle.includes(title) || title.includes(pTitle);
                });

                if (found) {
                    let status = null;
                    if (config.statusProp && found.properties[config.statusProp]) {
                        const sProp = found.properties[config.statusProp];
                        if (sProp.type === 'status') status = sProp.status?.name;
                        else if (sProp.type === 'select') status = sProp.select?.name;
                    }
                    return { id: found.id, status };
                }
                return null;

            } catch (e) {
                console.warn("Notion check failed for", title, e);
                return null;
            }
        };

        const fetchAladin = async (title, author) => {
            try {
                const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
                    params: {
                        ttbkey: ALADIN_TTBKEY,
                        Query: title,
                        QueryType: 'Title',
                        MaxResults: 1,
                        start: 1,
                        SearchTarget: 'Book',
                        output: 'js',
                        Version: '20131101'
                    }
                });

                if (response.data.item && response.data.item.length > 0) {
                    const item = response.data.item[0];
                    return {
                        title: item.title,
                        author: item.author.replace(/\s*\(.+?\)$/, ''),
                        cover: item.cover.replace('/coversum/', '/cover500/'),
                        link: item.link,
                        isbn: item.isbn13 || item.isbn,
                        publisher: item.publisher,
                        categoryName: item.categoryName
                    };
                }
                return null;
            } catch (e) {
                console.warn("Aladin fetch failed for", title);
                return null;
            }
        };

        const finalResults = await Promise.all(recommendations.map(async (rec) => {
            const aladinData = await fetchAladin(rec.title, rec.author);

            if (!aladinData) return null;

            const notionData = await checkNotion(aladinData.title, aladinData.author);

            return {
                ...aladinData,
                existingPageId: notionData?.id || null,
                currentStatus: notionData?.status || null
            };
        }));

        res.status(200).json(finalResults.filter(r => r !== null));

    } catch (error) {
        console.error('AI Recommend Error:', error);
        // Return more detailed error for debugging
        res.status(500).json({
            error: error.message || 'AI Processing Failed',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            details: error.response?.data || 'No external API response details'
        });
    }
}
