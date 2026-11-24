(() => {
  if (document.querySelector(".site-header")) return;

  function parseRgb(colorStr) {
    const match = colorStr && colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;
    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    const a = match[4] !== undefined ? Number(match[4]) : 1;
    return { r, g, b, a };
  }

  function getEffectiveBackgroundColor() {
    for (const el of [document.body, document.documentElement]) {
      if (!el) continue;
      const rgb = parseRgb(getComputedStyle(el).backgroundColor);
      if (rgb && rgb.a > 0) return rgb;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  function getBackgroundImageUrl() {
    for (const el of [document.body, document.documentElement]) {
      if (!el) continue;
      const bgImg = getComputedStyle(el).backgroundImage;
      if (bgImg && bgImg !== "none") {
        const match = bgImg.match(/url\(["']?([^"')]+)["']?\)/);
        if (match) return match[1];
      }
    }
    return null;
  }

  function isLightColor({ r, g, b }) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness >= 128;
  }

  function isAccessibilityMode() {
    const themeLink = document.getElementById("theme");
    return Boolean(
      themeLink && (themeLink.getAttribute("href") || "").includes("readable.css")
    );
  }

  function getImageBrightness(url, fallbackBg, callback) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = Math.min(img.naturalWidth || 64, 64);
        const h = Math.min(img.naturalHeight || 64, 64);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = `rgb(${fallbackBg.r}, ${fallbackBg.g}, ${fallbackBg.b})`;
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let total = 0;
        const count = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          total += (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
        }
        callback(total / count >= 128);
      } catch {
        callback(isLightColor(fallbackBg));
      }
    };
    img.onerror = () => callback(isLightColor(fallbackBg));
    img.src = url;
  }

  function updateHeaderContrast(header) {
    if (!header) return;
    if (isAccessibilityMode()) {
      header.style.color = "#000000";
      return;
    }

    const bgColor = getEffectiveBackgroundColor();
    const bgUrl = getBackgroundImageUrl();

    if (bgUrl) {
      getImageBrightness(bgUrl, bgColor, (isLight) => {
        if (!isAccessibilityMode()) {
          header.style.color = isLight ? "#000000" : "#ffffff";
        }
      });
    } else {
      header.style.color = isLightColor(bgColor) ? "#000000" : "#ffffff";
    }
  }

  function injectLayout() {
    if (document.querySelector(".site-header")) return;

    const style = document.createElement("style");
    style.textContent = `
      .site-header {
        font-family: "VT323", monospace;
        font-size: 1.35rem;
        text-align: center;
        padding: 0.75rem 1rem;
        margin: 0 auto 1.5rem auto;
        max-width: 820px;
        border-bottom: 2px dashed currentColor;
      }

      .site-header nav {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 0.5rem 1.25rem;
      }

      .site-header a {
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      .site-header a:hover {
        opacity: 0.75;
      }

      .site-footer {
        text-align: center;
        padding: 1.5rem 1rem 2rem 1rem;
        margin: 2.5rem auto 0 auto;
        max-width: 820px;
        border-top: 2px dashed currentColor;
      }

      .site-footer-gifs {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 1.25rem;
      }

      .site-footer-gifs a {
        display: inline-block;
        line-height: 0;
      }

      .site-footer-gifs img {
        max-height: 200px;
        width: auto;
        border: 0;
      }
    `;
    document.head.appendChild(style);

    // Header: formatted text links
    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `
      <nav aria-label="Site navigation">
        <a href="/index.html">Homepage</a>
        <span aria-hidden="true">·</span>
        <a href="/m/all-posts.html">All Posts</a>
        <span aria-hidden="true">·</span>
        <a href="https://www.ultraguest.com/view/pinecone-rodeo">Guestbook</a>
        <span aria-hidden="true">·</span>
        <a href="/updates.html">Updates</a>
        <span aria-hidden="true">·</span>
        <a href="/books.html">Bookshelf</a>
      </nav>
    `;
    document.body.prepend(header);

    updateHeaderContrast(header);
    window.addEventListener("load", () => updateHeaderContrast(header));

    const themeLink = document.getElementById("theme");
    if (themeLink) {
      themeLink.addEventListener("load", () => updateHeaderContrast(header));
      new MutationObserver(() => {
        setTimeout(() => updateHeaderContrast(header), 50);
      }).observe(themeLink, { attributes: true, attributeFilter: ["href"] });
    }

    // Remove legacy back.gif links on existing pages to avoid duplicates
    document.querySelectorAll('a[href$="index.html"] img[src*="back.gif"]').forEach((img) => {
      const link = img.closest("a");
      const parentP = link ? link.closest("p") : null;
      if (parentP && parentP.textContent.trim() === "") {
        parentP.remove();
      } else if (link) {
        link.remove();
      }
    });

    // Footer: guestbook gif + back to homepage gif
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="site-footer-gifs">
        <a href="https://www.ultraguest.com/view/pinecone-rodeo" title="Sign my Guestbook">
          <img src="/m/guestbook-fire.gif" alt="Sign my Guestbook" />
        </a>
        <a href="/index.html" title="Back to Homepage">
          <img src="/bg/RWAssets/back.gif" alt="Back to Homepage" />
        </a>
      </div>
    `;
    document.body.append(footer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectLayout);
  } else {
    injectLayout();
  }
})();
