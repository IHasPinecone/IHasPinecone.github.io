const fs = require("fs");

const SITE_URL = "https://ihaspinecone.github.io";
const SITE_TITLE = "Pinecone Rodeo";
const SITE_DESCRIPTION = "Is It Possible For a Man to Love Board Games and Jesus Christ?";

const posts = JSON.parse(
  fs.readFileSync("posts.json", "utf8")
);

function parseDate(dateStr) {
  const [month, day, year] = dateStr.split("/");
  return new Date(year, month - 1, day);
}

posts.sort(
  (a, b) => parseDate(b.datetime) - parseDate(a.datetime)
);

const items = posts.map(post => {
  const link = `${SITE_URL}/${post.link}`;

  return `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${parseDate(post.datetime).toUTCString()}</pubDate>
    <category><![CDATA[${post.topic || "General"}]]></category>
    <description><![CDATA[
      ${post.topic || "Post"}
      ${post.readTime || ""}
    ]]></description>
  </item>`;
}).join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>

${items}

  </channel>
</rss>`;

fs.writeFileSync("rss.xml", rss);

console.log("rss.xml generated");
