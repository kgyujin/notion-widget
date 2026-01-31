import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { pageId, statusProp, newStatus, notionToken } = req.body;

    if (!pageId || !statusProp || !newStatus || !notionToken) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const notion = new Client({ auth: notionToken });

    try {
        const page = await notion.pages.retrieve({ page_id: pageId });
        const prop = page.properties[statusProp];

        if (!prop) {
            return res.status(400).json({ error: `Property "${statusProp}" not found on page.` });
        }

        const updateBody = {};

        if (prop.type === 'status') {
            updateBody[statusProp] = { status: { name: newStatus } };
        } else if (prop.type === 'select') {
            updateBody[statusProp] = { select: { name: newStatus } };
        } else if (prop.type === 'rich_text') {
            updateBody[statusProp] = { rich_text: [{ text: { content: newStatus } }] };
        } else {
            return res.status(400).json({ error: `Unsupported status property type: ${prop.type}` });
        }

        await notion.pages.update({
            page_id: pageId,
            properties: updateBody
        });

        res.status(200).json({ success: true, message: `Status updated to "${newStatus}"` });

    } catch (error) {
        console.error('Notion Update Error:', error);
        res.status(500).json({ error: error.message || 'Failed to update status' });
    }
}
