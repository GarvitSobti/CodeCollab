const axios = require('axios');

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractMeta(html, key) {
  const metaRegex = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const match = html.match(metaRegex);
  return decodeHtml(match?.[1] || '');
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return decodeHtml(titleMatch?.[1] || '');
}

async function fetchLinkPreview(url) {
  const parsed = new URL(url);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Unsupported link protocol');
  }

  const response = await axios.get(url, {
    timeout: 4000,
    maxContentLength: 1024 * 1024,
    headers: {
      'User-Agent': 'CodeCollabLinkPreviewBot/1.0',
    },
  });

  const html = typeof response.data === 'string' ? response.data.slice(0, 100000) : '';
  const title = extractMeta(html, 'og:title') || extractTitle(html);
  const description = extractMeta(html, 'og:description') || extractMeta(html, 'description');
  const image = extractMeta(html, 'og:image');

  return {
    url,
    hostname: parsed.hostname,
    title: title || parsed.hostname,
    description: description || '',
    image: image || null,
  };
}

module.exports = { fetchLinkPreview };
