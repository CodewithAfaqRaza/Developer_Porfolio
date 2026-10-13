import { readFileSync, writeFileSync } from "node:fs";

const supplied = process.argv[2];
if (!supplied)
  throw new Error("Usage: npm run seo -- https://your-project.pages.dev");
const url = new URL(supplied);
if (
  url.protocol !== "https:" ||
  url.username ||
  url.password ||
  url.search ||
  url.hash ||
  url.pathname !== "/"
) {
  throw new Error(
    "Use the final HTTPS site origin without credentials, a path, query, or fragment.",
  );
}
const profile = readFileSync("src/data/profile.ts", "utf8");
if (!/contentApproved:\s*true\b/.test(profile)) {
  throw new Error(
    "Replace dummy content and set contentApproved: true in src/data/profile.ts first.",
  );
}
const origin = url.origin;
let html = readFileSync("index.html", "utf8").replace(
  'content="noindex, nofollow"',
  'content="index, follow"',
);
html = html.replace(
  /\s*<!-- deployed-seo:start -->[\s\S]*?<!-- deployed-seo:end -->/g,
  "",
);
html = html.replace(
  "</head>",
  `  <!-- deployed-seo:start -->\n    <link rel="canonical" href="${origin}/" />\n    <meta property="og:url" content="${origin}/" />\n    <meta property="og:image" content="${origin}/og-cover.png" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <!-- deployed-seo:end -->\n  </head>`,
);
writeFileSync("index.html", html);
writeFileSync(
  "public/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`,
);
console.log(
  `Configured canonical, sharing metadata, robots, and sitemap for ${origin}`,
);
