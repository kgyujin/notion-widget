import axios from 'axios';

export default async function handler(req, res) {
    const { query } = req.query;
    const ALADIN_API_KEY = process.env.ALADIN_TTBKEY;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    // Fallback for development if no key provided (User should provide one in prod, or I use a demo key if possible, but strict Aladin usage requires key)
    // Since this is a "widget" for others, they might need their own proxy or key. 
    // However, I will code it to use the Env var.

    if (!ALADIN_API_KEY) {
        // Return a mock response for testing/demo if key is missing? or Error?
        // Better to error so they know to set it up.
        return res.status(500).json({ error: 'ALADIN_TTBKEY is not configured on the server.' });
    }

    try {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemSearch.aspx', {
            params: {
                ttbkey: ALADIN_API_KEY,
                Query: query,
                QueryType: 'Title',
                MaxResults: 10,
                start: 1,
                SearchTarget: 'Book',
                output: 'js', // JSON output
                Version: '20131101'
            }
        });

        // Aladin returns JSON in a slightly weird format sometimes or just standard JSON if output=js
        // Check response structure
        if (response.data.errorCode) {
            return res.status(400).json({ error: response.data.errorMessage });
        }

        const books = response.data.item.map(item => {
            // 1. Clean Author: Remove (Role) e.g. (지은이), (옮긴이)
            // Regex: Remove space + parenthesis at the end
            const cleanAuthor = item.author.replace(/\s*\(.+?\)$/, '');

            // 2. Clean Category: Pick 2nd depth if available
            // "Part1>Part2>Part3" -> "Part2"
            const categoryParts = item.categoryName.split('>');
            const cleanCategory = categoryParts.length > 1 ? categoryParts[1] : item.categoryName;

            // 3. High Res Cover: "coversum" -> "cover500" or "cover"
            // Aladin URLs: .../coversum/... -> .../cover500/... gives better quality
            const highResCover = item.cover.replace('/coversum/', '/cover500/');

            return {
                title: item.title,
                author: cleanAuthor,
                publisher: item.publisher,
                pubDate: item.pubDate,
                cover: highResCover,
                isbn: item.isbn13 || item.isbn,
                link: item.link,
                categoryName: cleanCategory
            };
        });

        res.status(200).json(books);
    } catch (error) {
        console.error('Aladin API Error:', error);
        res.status(500).json({ error: 'Failed to fetch data from Aladin API' });
    }
}
