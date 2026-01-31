import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query, config } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const ALADIN_TTBKEY = process.env.ALADIN_TTBKEY;

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Recommend 5 books based on this request: "${query}".
        Return ONLY a JSON array. Do not use Markdown codes.
        Each object must have:
        - "title" (Exact Korean Book Title)
        - "author" (Korean Author Name)
        - "reason" (A short, friendly sentence explaining why this book is recommended for this specific request, in Korean. Use a warm and empathetic tone.)
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const recommendations = JSON.parse(jsonStr);

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
                        Output: 'JS',
                        Version: '20131101'
                    }
                });

                if (response.data.item && response.data.item.length > 0) {
                    const item = response.data.item[0];
                    return {
                        title: item.title,
                        author: item.author.replace(/\s*\(.+?\)$/, ''),
                        cover: item.cover.replace('coversum', 'cover500'),
                        publisher: item.publisher,
                        categoryName: item.categoryName.split('>')[1] || item.categoryName,
                        isbn: item.isbn13 || item.isbn,
                        link: item.link,
                        description: item.description
                    };
                }
                return null;
            } catch (e) {
                console.error(`Aladin API Error for ${title}:`, e.message);
                return null;
            }
        };

        const checkNotion = async (title, author) => {
            try {
                const notion = new Client({ auth: config.notionToken });

                const response = await notion.databases.query({
                    database_id: config.databaseId,
                    filter: {
                        and: [
                            {
                                property: config.propertyMap.title,
                                title: { equals: title }
                            }
                        ]
                    }
                });

                if (response.results.length > 0) {
                    const page = response.results[0];
                    let status = null;
                    if (config.statusProp && page.properties[config.statusProp]) {
                        const prop = page.properties[config.statusProp];
                        if (prop.type === 'status') status = prop.status?.name;
                        else if (prop.type === 'select') status = prop.select?.name;
                    }
                    return { id: page.id, status };
                }
                return null;
            } catch (e) {
                console.error("Notion Check Error:", e.message);
                return null;
            }
        };

        const finalResults = await Promise.all(recommendations.map(async (rec) => {
            const aladinData = await fetchAladin(rec.title, rec.author);
            if (!aladinData) return null;

            const notionData = await checkNotion(aladinData.title, aladinData.author);

            return {
                ...aladinData,
                reason: rec.reason,
                existingPageId: notionData?.id || null,
                currentStatus: notionData?.status || null
            };
        }));

        res.status(200).json(finalResults.filter(Boolean));

    } catch (error) {
        console.error('AI Recommend Error:', error);
        res.status(500).json({
            error: error.message || 'AI Processing Failed',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            details: error.response?.data || 'No external API response details'
        });
    }
}
