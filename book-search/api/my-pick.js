import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { databaseId, config } = req.body;
    const { notionToken, statusProp, statusValUnread, propertyMap } = config;

    if (!notionToken || !databaseId || !statusProp || !statusValUnread) {
        return res.status(400).json({ error: 'Missing configuration (Token, DB ID, Status settings)' });
    }

    const notion = new Client({ auth: notionToken });

    try {
        // First, retrieve the database schema to check the property type
        const db = await notion.databases.retrieve({ database_id: databaseId });
        const schemaProps = db.properties;

        const targetProp = schemaProps[statusProp];
        if (!targetProp) {
            return res.status(400).json({ error: `Property "${statusProp}" does not exist in the database.` });
        }

        let filter;
        if (targetProp.type === 'status') {
            filter = { property: statusProp, status: { equals: statusValUnread } };
        } else if (targetProp.type === 'select') {
            filter = { property: statusProp, select: { equals: statusValUnread } };
        } else if (targetProp.type === 'rich_text') {
            filter = { property: statusProp, rich_text: { equals: statusValUnread } };
        } else {
            return res.status(400).json({ error: `Unsupported status property type: ${targetProp.type}` });
        }

        const queryRes = await notion.databases.query({
            database_id: databaseId,
            filter: filter,
            page_size: 100
        });

        const results = queryRes.results;
        if (results.length === 0) {
            return res.status(200).json({ empty: true, message: "읽지 않은 책이 없습니다." });
        }

        const randomPage = results[Math.floor(Math.random() * results.length)];

        const p = propertyMap;
        const getPlainText = (page, propName) => {
            const prop = page.properties[propName];
            if (!prop) return "";
            if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('');
            if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('');
            if (prop.type === 'select') return prop.select?.name || "";
            if (prop.type === 'multi_select') return prop.multi_select.map(o => o.name).join(', ');
            if (prop.type === 'files') return prop.files[0]?.file?.url || prop.files[0]?.external?.url || "";
            if (prop.type === 'url') return prop.url || "";
            return "";
        };

        let coverUrl = getPlainText(randomPage, p.cover);
        if (!coverUrl && randomPage.cover) {
            coverUrl = randomPage.cover.external?.url || randomPage.cover.file?.url;
        }

        const book = {
            id: randomPage.id,
            title: getPlainText(randomPage, p.title),
            author: getPlainText(randomPage, p.author),
            cover: coverUrl,
            status: statusValUnread
        };

        res.status(200).json({ book });

    } catch (error) {
        console.error('Notion Pick Error:', error);
        res.status(500).json({ error: error.message || 'Failed to pick a book' });
    }
}
