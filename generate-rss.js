const fs = require("fs");

const SITE_URL = "https://ihaspinecone.github.io";
const SITE_TITLE = "Pinecone Rodeo";
const SITE_DESCRIPTION = "Is It Possible For a Man to Love Board Games and Jesus Christ?";

// Safely read and parse posts.json
let posts = [];
try {
  const rawData = fs.readFileSync("posts.json", "utf8");
  posts = JSON.parse(rawData);
} catch (err) {
  console.error("Error reading or parsing posts.json:", err.message);
  process.exit(1);
}

function sanitize(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim();
}

function parseDate(dateStr) {
  if (!dateStr) return new Date(0);
  
  // Handle "MM/DD/YYYY" format
  if (dateStr.includes("/")) {
    const [month, day, year] = dateStr.split("/");
    const parsed = new Date(year, month - 1, day);
    return isNaN(parsed) ? new Date(0) : parsed;
  }
  
  // Fallback for ISO strings or other formats
  const parsed = new Date(dateStr);
  return isNaN(parsed) ? new Date(0) : parsed;
}

// Safely sort posts
posts.sort(
  (a, b) => parseDate(b.datetime) - parseDate(a.datetime)
);

function extractBodyContent(html = "") {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;

  content = content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");

  return content.replace(/]]>/g, "]]]]><![CDATA[>");
}

function makeUrlsAbsolute(html, postUrl) {
  // Matches src="..." or src='...' or href="..." or href='...'
  return html.replace(/(src|href)=["']([^"']+)["']/gi, (match, attr, val) => {
    // Skip already absolute URLs, data URIs, anchors, mailto links, etc.
    if (
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      val.startsWith("data:") ||
      val.startsWith("#") ||
      val.startsWith("mailto:") ||
      val.startsWith("javascript:")
    ) {
      return match;
    }
    try {
      // Normalize Windows-style backslashes to forward slashes just in case
      const normalizedVal = val.replace(/\\/g, "/");
      const absoluteUrl = new URL(normalizedVal, postUrl).href;
      return `${attr}="${absoluteUrl}"`;
    } catch (err) {
      return match;
    }
  });
}

function buildNormalItems(feedPosts) {
  return feedPosts.map(post => {
    if (!post || !post.link) {
      console.warn("Skipping a post due to missing link property.");
      return "";
    }

    const cleanLink = post.link.replace(/^\/+/, "");
    const postUrl = `${SITE_URL}/${cleanLink}`;

    let htmlContent = "";
    try {
      if (fs.existsSync(cleanLink)) {
        const fullHtml = fs.readFileSync(cleanLink, "utf8");
        htmlContent = extractBodyContent(fullHtml);
        // Automatically parse and convert relative paths to absolute URLs
        htmlContent = makeUrlsAbsolute(htmlContent, postUrl);
      } else {
        console.warn(`File not found on disk: ${cleanLink}`);
      }
    } catch (err) {
      console.error(`Could not read ${cleanLink}: ${err.message}`);
    }

    const safeTitle = sanitize(post.title || "Untitled")
      .replace(/]]>/g, "]]]]><![CDATA[>");

    const safeSummary = sanitize(post.summary || "")
      .replace(/]]>/g, "]]]]><![CDATA[>");

    const postDate = parseDate(post.datetime);

    return `
    <item>
      <title><![CDATA[${safeTitle}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${postDate.toUTCString()}</pubDate>
      <description><![CDATA[${safeSummary}]]></description>
      <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
    </item>`;
  }).filter(Boolean).join("\n");
}

const normalPosts = posts.filter(
  post => post && post.topic !== "Podcast"
);
const normalItems = buildNormalItems(normalPosts);

const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
xmlns:content="http://purl.org/rss/1.0/modules/content/"
>
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>

    ${normalItems}

  </channel>
</rss>`;

fs.writeFileSync("rss.xml", rssFeed);
console.log("rss.xml generated successfully[cite: 3]");
