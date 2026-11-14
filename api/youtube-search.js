/**
 * Song search through the YouTube Data API v3, run on Vercel so the API key stays on
 * the server. GET /api/youtube-search?q=<judul atau artis> returns
 * { items: [{ videoId, title, channel, thumbnail, publishedAt }] }.
 *
 * Results lean towards Indonesian music (region ID, language id, Music category) and
 * only include videos that can be embedded. Each search costs 100 of the key's 10,000
 * daily quota units, so answers are cached on Vercel's CDN for a day per query.
 *
 * Needs the YOUTUBE_API_KEY environment variable.
 */
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const MAX_QUERY_LENGTH = 100;

// The site's own origins may call this from the browser (GitHub Pages lives elsewhere).
const ALLOWED_ORIGINS = [/^https:\/\/phoe88\.github\.io$/, /^https:\/\/jokiwebapp\.vercel\.app$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", '#34': '"' };

/** The API returns HTML-escaped titles, for example "Rock &amp; Roll". */
function decodeEntities(text = '') {
  return text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, code) => {
    if (ENTITIES[code] !== undefined) return ENTITIES[code];
    if (code[0] === '#') {
      const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    return match;
  });
}

/** Always varies on Origin, so the CDN never hands one origin's cached answer to another. */
function corsHeaders(request) {
  const origin = request.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.some((pattern) => pattern.test(origin))) return { Vary: 'Origin' };
  return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' };
}

function json(request, status, body, cache = 'no-store') {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache, ...corsHeaders(request) },
  });
}

/** Turns a YouTube API error into a message a visitor can act on. */
function describeApiError(status, payload) {
  const reason = payload?.error?.errors?.[0]?.reason ?? '';
  if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
    return { status: 429, error: 'Kuota pencarian YouTube hari ini sudah habis. Coba lagi besok.' };
  }
  if (reason === 'rateLimitExceeded' || reason === 'userRateLimitExceeded') {
    return { status: 429, error: 'Terlalu banyak pencarian sekaligus. Tunggu sebentar lalu coba lagi.' };
  }
  if (status === 400 && /key/i.test(payload?.error?.message ?? '')) {
    return { status: 503, error: 'Pencarian lagu belum diatur dengan benar (API key tidak valid).' };
  }
  if (status === 403) {
    return { status: 503, error: 'Pencarian lagu sedang tidak diizinkan oleh YouTube. Coba lagi nanti.' };
  }
  return { status: 502, error: 'YouTube sedang tidak bisa dihubungi. Coba lagi sebentar lagi.' };
}

export function OPTIONS(request) {
  const headers = corsHeaders(request);
  if (headers['Access-Control-Allow-Origin']) {
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return new Response(null, { status: 204, headers });
}

export async function GET(request) {
  const query = (new URL(request.url).searchParams.get('q') ?? '').trim().replace(/\s+/g, ' ');
  if (!query) return json(request, 400, { error: 'Tulis judul lagu atau nama artis dulu.' });
  if (query.length > MAX_QUERY_LENGTH) {
    return json(request, 400, { error: `Kata kunci terlalu panjang (maksimal ${MAX_QUERY_LENGTH} karakter).` });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return json(request, 503, { error: 'Pencarian lagu belum diaktifkan di server.' });

  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoCategoryId: '10', // Music
    videoEmbeddable: 'true',
    regionCode: 'ID',
    relevanceLanguage: 'id',
    safeSearch: 'moderate',
    maxResults: '12',
    fields: 'items(id/videoId,snippet(title,channelTitle,publishedAt,thumbnails(medium/url,high/url)))',
    key,
  }).toString();

  let response;
  let payload;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    payload = await response.json();
  } catch {
    return json(request, 502, { error: 'YouTube sedang tidak bisa dihubungi. Coba lagi sebentar lagi.' });
  }

  if (!response.ok) {
    const { status, error } = describeApiError(response.status, payload);
    return json(request, status, { error });
  }

  const items = (payload.items ?? [])
    .filter((item) => item.id?.videoId)
    .map(({ id, snippet }) => ({
      videoId: id.videoId,
      title: decodeEntities(snippet.title),
      channel: decodeEntities(snippet.channelTitle),
      thumbnail: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${id.videoId}/mqdefault.jpg`,
      publishedAt: snippet.publishedAt,
    }));

  return json(request, 200, { query, items }, 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
}
