import axios from 'axios';

export default async function handler(req, res) {
    const { query } = req.query;
    const ALADIN_API_KEY = process.env.ALADIN_TTBKEY;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    if (!ALADIN_API_KEY) {
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
                output: 'js',
                Version: '20131101'
            }
        });

        if (response.data.errorCode) {
            return res.status(400).json({ error: response.data.errorMessage });
        }

        const books = response.data.item.map(item => {
            const cleanAuthor = item.author.replace(/\s*\(.+?\)$/, '');
            const categoryParts = item.categoryName.split('>');
            const cleanCategory = categoryParts.length > 1 ? categoryParts[1] : item.categoryName;
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
