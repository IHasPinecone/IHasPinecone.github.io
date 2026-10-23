const fs = require("fs");

const SITE_URL = "https://ihaspinecone.github.io";
const SITE_TITLE = "Pinecone Rodeo";
const SITE_DESCRIPTION = "Is It Possible For a Man to Love Board Games and Jesus Christ?";

const posts = JSON.parse(
  fs.readFileSync("posts.json", "utf8")
);

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
  const [month, day, year] = dateStr.split("/");
  return new Date(year, month - 1, day);
}

posts.sort(
  (a, b) => parseDate(b.datetime) - parseDate(a.datetime)
);

function extractBodyContent(html = "") {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  let content = bodyMatch ? bodyMatch[1] : html;

  // Remove elements that should not be embedded in an RSS reader.
  content = content
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "");

  // Prevent embedded content from closing the RSS CDATA section.
  return content.replace(/]]>/g, "]]]]><![CDATA[>");
}

function buildNormalItems(feedPosts) {
  return feedPosts.map(post => {
    const cleanLink = post.link.replace(/^\/+/, "");
    const postUrl = `${SITE_URL}/${cleanLink}`;

    let htmlContent = "";

    try {
      const fullHtml = fs.readFileSync(cleanLink, "utf8");
      htmlContent = extractBodyContent(fullHtml);
    } catch (err) {
      console.error(`Could not read ${cleanLink}: ${err.message}`);
    }

    const safeTitle = sanitize(post.title)
      .replace(/]]>/g, "]]]]><![CDATA[>");

    const safeSummary = sanitize(post.summary || "")
      .replace(/]]>/g, "]]]]><![CDATA[>");

    return `
    <item>
      <title><![CDATA[${safeTitle}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${parseDate(post.datetime).toUTCString()}</pubDate>
      <description><![CDATA[${safeSummary}]]></description>
      <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
    </item>`;
  }).join("\n");
}

const normalPosts = posts.filter(
  post => post.topic !== "Podcast"
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

console.log("rss.xml generated");
