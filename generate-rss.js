const fs = require("fs");

const SITE_URL = "https://ihaspinecone.github.io";
const SITE_TITLE = "Pinecone Rodeo";
const SITE_DESCRIPTION =
  "Is It Possible For a Man to Love Board Games and Jesus Christ?";

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

const podcastPosts = posts.filter(
  post => post.topic === "podcast"
);

function buildFeed(feedPosts) {
  return feedPosts.map(post => {
    const postUrl = `${SITE_URL}/${post.link}`;

    const imageHtml = post.coverImage
      ? `<imgTE_URL}/${post.coverImage}<br/><br/>`
      : "";

    const summary = post.summary || "";

    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${parseDate(post.datetime).toUTCString()}</pubDate>
      <category><![CDATA[${post.topic || "General"}]]></category>
      <description><![CDATA[
        ${summary}
      ]]></description>
    </item>`;
  }).join("\n");
}

const normalItems = buildFeed(posts);

const normalRss = `<?xml version="1.0" encoding="UTF-8"?>
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

fs.writeFileSync("rss.xml", normalRss);

const podcastItems = buildFeed(podcastPosts);

const podcastRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
xmlns:content="http://purl.org/rss/1.0/modules/content/"
>
  <channel>
    <title>Pinecone Rodeo Podcast</title>
    <link>${SITE_URL}</link>
    <description>Podcast feed</description>
    <language>en-us</language>
    ${podcastItems}
  </channel>
</rss>`;

fs.writeFileSync("podcast.xml", podcastRss);


console.log("rss.xml generated");
