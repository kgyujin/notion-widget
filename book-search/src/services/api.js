export const searchBooks = async (query, ttbKey, proxyUrl = '') => {
  if (!query || !ttbKey) return [];
  
  // Aladin API URL
  const baseUrl = 'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
  const params = new URLSearchParams({
    ttbkey: ttbKey,
    Query: query,
    QueryType: 'Title',
    MaxResults: '10',
    start: '1',
    SearchTarget: 'Book',
    output: 'js', // JSON format
    Version: '20131101'
  });

  const targetUrl = `${baseUrl}?${params.toString()}`;
  // Use proxy if provided, otherwise fetch directly (which might fail CORS in browser unless extension/local proxy used)
  const url = proxyUrl ? `${proxyUrl}${encodeURIComponent(targetUrl)}` : targetUrl;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.item || [];
  } catch (error) {
    console.error("Aladin Search Error:", error);
    throw error;
  }
};

export const saveToNotion = async (book, config) => {
  const { notionKey, databaseId, proxyUrl, properties } = config;
  
  const notionUrl = 'https://api.notion.com/v1/pages';
  const url = proxyUrl ? `${proxyUrl}${encodeURIComponent(notionUrl)}` : notionUrl;

  // Construct properties based on user mapping
  // Defaults: Title -> title, Author -> rich_text, etc.
  
  const payload = {
    parent: { database_id: databaseId },
    properties: {}
  };

  // 1. Title (Name)
  if (properties.title) {
    payload.properties[properties.title] = {
      title: [{ text: { content: book.title } }]
    };
  }

  // 2. Author (Text)
  if (properties.author) {
    payload.properties[properties.author] = {
      rich_text: [{ text: { content: book.author } }]
    };
  }

  // 3. Publisher (Select) - Use select or rich_text depending on preference, usually select is better but safer with rich_text if options not created. 
  // Let's assume rich_text for safety unless we want to deal with option creation, or just try select and let Notion handle it (Notion API allows creating options for Select).
  if (properties.publisher) {
    payload.properties[properties.publisher] = {
      select: { name: book.publisher }
    };
  }

  // 4. Genre (Select) - Aladin gives categoryName "Domestic > Fiction > ..."
  // We'll take the first part or last part. Let's take the specific category.
  if (properties.genre) {
     const category = book.categoryName ? book.categoryName.split('>')[1] || book.categoryName.split('>')[0] : 'Unknown';
    payload.properties[properties.genre] = {
      select: { name: category.trim() }
    };
  }

  // 5. Cover (Files & Media or URL) - Using Files & Media external URL
  if (properties.cover) {
    payload.properties[properties.cover] = {
      files: [
        {
          name: "Cover",
          type: "external",
          external: { url: book.cover }
        }
      ]
    };
  }

  // Also set page cover and icon
  payload.cover = {
    type: "external",
    external: { url: book.cover }
  };
  payload.icon = {
    type: "emoji",
    emoji: "📖"
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        ...(proxyUrl ? { 'X-Target-URL': notionUrl } : {}) // Some proxies might need this
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.message || 'Notion API Error');
    }
    return await response.json();
  } catch (error) {
    console.error("Notion Save Error:", error);
    throw error;
  }
};
