const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://pinecone.rodeo';
const SONGS_JSON = path.join(__dirname, '..', 'songs.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'songs');

function getBreviaryWeekLabel(weekNum) {
  const num = Number(weekNum);
  const ord = (n) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;
  if (num >= 1 && num <= 4) return `${ord(num)} Week of Advent`;
  if (num === 5) return 'Christmas Season';
  if (num >= 6 && num <= 10) return `${ord(num - 5)} Week of Ordinary Time`;
  if (num >= 11 && num <= 16) return `${ord(num - 10)} Week of Lent`;
  if (num >= 17 && num <= 23) return `${ord(num - 16)} Week of Easter`;
  return `${ord(num - 23)} Week of Ordinary Time`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(text) {
  return String(text || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const songs = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf8'));
const weeks = {};

for (const song of songs) {
  if (!song.name || !song.name.trim()) continue;
  const w = Number(song.week || 1);
  if (!weeks[w]) weeks[w] = [];
  weeks[w].push(song);
}

for (const [weekNum, weekSongs] of Object.entries(weeks)) {
  const weekLabel = getBreviaryWeekLabel(weekNum);
  const title = `Songs from ${weekLabel}`;

  const lines = [];
  let coverUrl = '';

  for (const s of weekSongs) {
    const reviewClean = stripHtml(s.review);
    let entry = `${s.name} by ${s.artist}`;
    if (reviewClean) entry += `: ${reviewClean}`;
    lines.push(entry);

    if (!coverUrl && s.cover) {
      coverUrl = `${BASE_URL}/${s.cover.replace(/^\//, '')}`;
    }
  }

  let description = lines.join('\n\n');
  if (description.length > 380) {
    description = description.slice(0, 377).replace(/\s+\S*$/, '') + '...';
  }

  const targetUrl = `${BASE_URL}/songs.html?week=${weekNum}`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="theme-color" content="#ffcc00">
  <meta property="og:site_name" content="Music from Beyond">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(targetUrl)}">
  ${coverUrl ? `<meta property="og:image" content="${escapeHtml(coverUrl)}">` : ''}
  <meta name="twitter:card" content="summary">
  <meta http-equiv="refresh" content="0; url=../songs.html?week=${weekNum}">
</head>
<body style="background:#140e08;color:#ffcc00;font-family:monospace;">
  <p>Redirecting to <a href="../songs.html?week=${weekNum}" style="color:#ffcc00;">${escapeHtml(weekLabel)}</a>...</p>
</body>
</html>
`;

  const outPath = path.join(OUTPUT_DIR, `week-${weekNum}.html`);
  fs.writeFileSync(outPath, htmlContent, 'utf8');
  console.log(`Generated ${outPath}`);
}
