import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { notionToken, databaseId, book, confirm } = req.body;

    if (!notionToken || !databaseId || !book) {
        return res.status(400).json({ error: '필수 정보가 누락되었습니다 (Token, Database ID, Book)' });
    }

    const notion = new Client({ auth: notionToken });

    try {
        const { propertyMap } = req.body;
        const p = propertyMap || {
            title: "제목",
            author: "저자",
            category: "장르",
            publisher: "출판사",
            cover: "표지"
        };

        let dbSchemaProperties = {};
        try {
            const dbInfo = await notion.databases.retrieve({ database_id: databaseId });
            dbSchemaProperties = dbInfo.properties;
        } catch (dbError) {
            console.error("Failed to retrieve database schema:", dbError);
            return res.status(500).json({ error: "데이터베이스 정보를 가져올 수 없습니다. ID와 토큰을 확인해주세요." });
        }

        const formatProp = (propName, value) => {
            if (!value) return null;

            const propSchema = dbSchemaProperties[propName];
            if (!propSchema) {
                return {
                    rich_text: [{ text: { content: String(value) } }]
                };
            }

            const type = propSchema.type;
            const cleanValue = String(value).substring(0, 100);

            if (type === 'select') {
                return {
                    select: { name: cleanValue.replace(/,/g, ' /') }
                };
            } else if (type === 'multi_select') {
                const values = String(value).split(/[,\/]/).map(v => v.trim()).filter(v => v.length > 0);
                return {
                    multi_select: values.map(v => ({ name: v.substring(0, 100) }))
                };
            } else if (type === 'rich_text') {
                return {
                    rich_text: [{ text: { content: String(value) } }]
                };
            } else if (type === 'title') {
                return {
                    title: [{ text: { content: String(value) } }]
                };
            } else if (type === 'url') {
                return { url: String(value) };
            }

            return {
                rich_text: [{ text: { content: String(value) } }]
            };
        };

        const normalize = (str) => String(str).replace(/\(.*\)/g, '').replace(/\s+/g, '').toLowerCase();
        const bookTitleClean = normalize(book.title);
        const bookAuthorClean = normalize(book.author);

        let pageIdToUpdate = null;
        let foundPageTitle = "";
        let foundPageAuthor = "";

        try {
            const queryResponse = await notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: p.title,
                    title: {
                        contains: book.title.split(' ')[0]
                    }
                }
            });

            for (const page of queryResponse.results) {
                const pageTitleProp = page.properties[p.title];
                const pageTitleRaw = pageTitleProp?.title?.map(t => t.plain_text).join('') || "";

                let pageAuthorRaw = "";
                if (p.author && page.properties[p.author]) {
                    const type = page.properties[p.author].type;
                    if (type === 'select') pageAuthorRaw = page.properties[p.author].select?.name || "";
                    else if (type === 'multi_select') pageAuthorRaw = page.properties[p.author].multi_select?.map(x => x.name).join(', ') || "";
                    else if (type === 'rich_text') pageAuthorRaw = page.properties[p.author].rich_text?.map(x => x.plain_text).join('') || "";
                }

                const pageTitleNorm = normalize(pageTitleRaw);
                const pageAuthorNorm = normalize(pageAuthorRaw);

                const titleMatch = pageTitleNorm === bookTitleClean;
                const titleSimilar = pageTitleNorm.includes(bookTitleClean) || bookTitleClean.includes(pageTitleNorm);
                const authorMatch = bookAuthorClean && pageAuthorNorm && (pageAuthorNorm.includes(bookAuthorClean) || bookAuthorClean.includes(pageAuthorNorm));

                if (titleMatch || (titleSimilar && authorMatch)) {
                    pageIdToUpdate = page.id;
                    foundPageTitle = pageTitleRaw;
                    foundPageAuthor = pageAuthorRaw;
                    break;
                }
            }
        } catch (searchError) {
            console.warn("Duplicate check warning:", searchError);
        }

        if (pageIdToUpdate && !confirm) {
            return res.status(200).json({
                action: 'confirm_required',
                message: '유사한 도서가 이미 존재합니다.',
                existingId: pageIdToUpdate,
                foundTitle: foundPageTitle,
                foundAuthor: foundPageAuthor
            });
        }

        const properties = {};

        if (p.title) properties[p.title] = { title: [{ text: { content: book.title } }] };

        if (p.author) {
            const prop = formatProp(p.author, book.author);
            if (prop) properties[p.author] = prop;
        }
        if (p.publisher) {
            const prop = formatProp(p.publisher, book.publisher);
            if (prop) properties[p.publisher] = prop;
        }
        if (p.category) {
            const prop = formatProp(p.category, book.categoryName);
            if (prop) properties[p.category] = prop;
        }

        if (p.cover && dbSchemaProperties[p.cover]) {
            const type = dbSchemaProperties[p.cover].type;
            if (type === 'files') {
                properties[p.cover] = {
                    files: [
                        {
                            name: book.title,
                            type: "external",
                            external: { url: book.cover }
                        }
                    ]
                };
            } else if (type === 'url') {
                properties[p.cover] = { url: book.cover };
            } else {
                properties[p.cover] = {
                    rich_text: [{ text: { content: book.cover } }]
                };
            }
        }

        let response;
        let action = 'created';

        if (pageIdToUpdate) {
            response = await notion.pages.update({
                page_id: pageIdToUpdate,
                properties: properties,
            });
            action = 'updated';
        } else {
            response = await notion.pages.create({
                parent: { database_id: databaseId },
                properties: properties,
            });
        }

        res.status(200).json({ success: true, url: response.url, action });
    } catch (error) {
        console.error('Notion API Error:', error);
        res.status(500).json({
            error: error.message || 'Notion API Error',
            code: error.code,
            details: error.body
        });
    }
}
