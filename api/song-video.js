/**
 * Finds the YouTube video of a song so the full track can play on the page.
 * GET /api/song-video?artist=<artis>&title=<judul>&duration=<detik, opsional> returns
 * { candidates: [{ videoId, title, channel, duration }] }, best match first.
 *
 * There's no API key: it reads YouTube's public search page, which is unofficial and
 * may break if YouTube changes that page. After a burst of searches from one server,
 * YouTube answers with a bot check instead; this then reports the search as
 * unavailable and the page plays iTunes' 30-second preview. Answers are cached on
 * Vercel's CDN for a day per song, so each song is looked up about once a day.
 *
 * Videos whose owners block embedding aren't filtered out here, to keep it to one
 * request per song; the page's player skips to the next candidate when one won't play.
 */
const SEARCH_URL = 'https://www.youtube.com/results';
const MAX_FIELD_LENGTH = 120;
const MAX_CANDIDATES = 5;

// The site's own origins may call this from the browser (GitHub Pages lives elsewhere).
const ALLOWED_ORIGINS = [/^https:\/\/phoe88\.github\.io$/, /^https:\/\/jokiwebapp\.vercel\.app$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];

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

/** "4:05" or "1:02:03" to seconds. */
function toSeconds(text = '') {
  return text.split(':').reduce((total, part) => total * 60 + Number(part), 0) || 0;
}

/** Pulls the JSON object assigned to `var ytInitialData` out of the page. */
function readInitialData(html) {
  const start = html.indexOf('{', html.indexOf('var ytInitialData = '));
  const end = html.indexOf(';</script>', start);
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(html.slice(start, end));
  } catch {
    return null;
  }
}

/** The first string found under `key` anywhere inside `node` that passes `test`. */
function findText(node, key, test) {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findText(child, key, test);
      if (found) return found;
    }
  } else if (node && typeof node === 'object') {
    if (typeof node[key] === 'string' && test(node[key])) return node[key];
    for (const child of Object.values(node)) {
      const found = findText(child, key, test);
      if (found) return found;
    }
  }
  return '';
}

const isLength = (text) => /^\d{1,2}(:\d{2}){1,2}$/.test(text);

/**
 * One search result as { videoId, title, channel, duration }, or null. YouTube serves
 * two layouts: the older `videoRenderer` and the newer `lockupViewModel`. Results
 * without a running time (live streams) come back as null.
 */
function toVideo(node) {
  const old = node.videoRenderer;
  if (old?.videoId) {
    const length = old.lengthText?.simpleText;
    if (!length) return null;
    return {
      videoId: old.videoId,
      title: old.title?.runs?.map((run) => run.text).join('') ?? '',
      channel: old.ownerText?.runs?.[0]?.text ?? '',
      duration: toSeconds(length),
    };
  }
  const lockup = node.lockupViewModel;
  if (lockup?.contentId && lockup.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
    const length = findText(lockup.contentImage, 'text', isLength);
    if (!length) return null;
    const meta = lockup.metadata?.lockupMetadataViewModel;
    // The byline's first part is the channel: its name sits by the avatar, or is plain text without one.
    const byline = meta?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0];
    return {
      videoId: lockup.contentId,
      title: meta?.title?.content ?? '',
      channel: byline?.avatarStack?.avatarStackViewModel?.text?.content ?? byline?.text?.content ?? '',
      duration: toSeconds(length),
    };
  }
  return undefined;
}

/** Every video in the search results, wherever YouTube nests them. */
function collectVideos(node, found = []) {
  if (Array.isArray(node)) {
    node.forEach((child) => collectVideos(child, found));
  } else if (node && typeof node === 'object') {
    const video = toVideo(node);
    if (video) found.push(video);
    else if (video === undefined) Object.values(node).forEach((child) => collectVideos(child, found));
  }
  return found;
}

/**
 * Reads the videos off YouTube's search page. Returns null when YouTube can't be
 * reached or read, or 'blocked' when it redirects, which is how it sends its bot
 * check; asking again straight away would only add to the load it's refusing.
 */
async function searchYouTube(query) {
  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({ search_query: query, sp: 'EgIQAQ==' /* videos only */, hl: 'en', gl: 'ID' }).toString();
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
      headers: {
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
        Cookie: 'SOCS=CAI', // skips the cookie consent page served in some regions
      },
    });
    if (response.status >= 300 && response.status < 400) return 'blocked';
    if (!response.ok) return null;
    const data = readInitialData(await response.text());
    return data ? collectVideos(data) : null;
  } catch {
    return null;
  }
}

/** Words that mark a different version of the song; lyric videos are only mildly worse. */
const VERSION_WORDS = [
  'cover', 'live', 'karaoke', 'instrumental', 'remix', 'sped up', 'slowed', 'reaction', 'nightcore', '8d',
  'version', 'drum', 'piano', 'acoustic', 'akustik', 'guitar', 'gitar', 'tutorial', 'chord', 'kunci', 'dj',
  'concert', 'konser', 'session', 'performance', 'unreleased',
  'lirik', 'lyrics', 'lyric',
];
const MILD_WORDS = new Set(['lirik', 'lyrics', 'lyric']);

const normalize = (text = '') => text.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * Higher is better. Rewards a running time close to the song's (when known), the
 * title and artist appearing in the video, and the artist's own or "Topic" channel;
 * penalises covers, live versions, karaoke and the like unless the song itself says so.
 */
function score(video, { artist, title, duration }) {
  const videoTitle = normalize(video.title);
  const channel = normalize(video.channel);
  const wanted = normalize(title);
  const by = normalize(artist);
  let points = 0;

  if (videoTitle.includes(wanted)) points += 3;
  if (videoTitle.includes(by) || channel.includes(by)) points += 3;
  else if (by) points -= 3; // probably someone else performing it
  if (channel.endsWith(' topic') || channel.endsWith('vevo') || channel === by) points += 2;

  const words = ` ${videoTitle} `;
  for (const word of VERSION_WORDS) {
    if (words.includes(` ${word} `) && !` ${wanted} `.includes(` ${word} `)) points -= MILD_WORDS.has(word) ? 1 : 4;
  }

  if (duration) {
    const off = Math.abs(video.duration - duration);
    if (off <= 3) points += 4;
    else if (off <= 10) points += 3;
    else if (off <= 30) points += 1;
    else if (off > 90) points -= 4;
  }
  return points;
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
  const params = new URL(request.url).searchParams;
  const clean = (name) => (params.get(name) ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_FIELD_LENGTH);
  const artist = clean('artist');
  // iTunes titles carry extras like "(feat. X)" or "[Remastered]" that YouTube titles often lack.
  const title = clean('title')
    .replace(/\s*[([](feat\.?|ft\.?|with|from|remaster|remastered|\d{4} remaster)[^)\]]*[)\]]/gi, '')
    .trim();
  const duration = Math.max(0, Math.round(Number(params.get('duration')) || 0));
  if (!title) return json(request, 400, { error: 'Judul lagu belum diisi.' });

  // A page without results is sometimes a one-off on YouTube's side, so it gets one more try.
  const query = `${artist} ${title}`.trim();
  let found = await searchYouTube(query);
  if (Array.isArray(found) && !found.length) found = await searchYouTube(query);
  if (!Array.isArray(found)) {
    return json(request, 503, { error: 'Lagu lengkap sedang tidak bisa dicari. Coba lagi sebentar lagi.' }, 'public, max-age=60, s-maxage=120');
  }

  const seen = new Set();
  const videos = found
    .filter((video) => !seen.has(video.videoId) && seen.add(video.videoId))
    .filter((video) => video.duration >= 30 && video.duration <= 20 * 60)
    .slice(0, 12);

  const wanted = { artist, title, duration };
  const candidates = videos
    .map((video, index) => ({ video, points: score(video, wanted) - index * 0.25 }))
    .sort((a, b) => b.points - a.points)
    .slice(0, MAX_CANDIDATES)
    .map(({ video }) => video);

  // `found` counts the videos read off the search page, which tells an empty page apart from no match.
  // An empty answer may be a blip on YouTube's side, so it isn't cached for long.
  const cache = candidates.length
    ? 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
    : 'public, max-age=60, s-maxage=300';
  return json(request, 200, { candidates, found: videos.length }, cache);
}
