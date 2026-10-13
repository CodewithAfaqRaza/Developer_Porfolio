import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { localContactPlugin } from "./server/local-contact";
import { profile } from "./src/data/profile";

const htmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export default defineConfig({
  plugins: [react(), tailwindcss(), localContactPlugin(), {
    name: "profile-page-metadata",
    transformIndexHtml(html) {
      const values = {
        __PROFILE_NAME__: profile.name,
        __PROFILE_TITLE__: `${profile.name} — ${profile.brandTagline}`,
        __PROFILE_DESCRIPTION__: profile.intro,
        __PROFILE_LINKEDIN__: profile.linkedin,
      };
      for (const [token, value] of Object.entries(values)) html = html.replaceAll(token, htmlEscape(value));
      return html;
    },
  }],
  server: {
    host: "127.0.0.1",
    fs: { deny: ["**/.env", "**/.env.*", "**/*.{crt,pem}", "**/.git/**", "**/.local/**", "**/.dev.vars*", "**/*.sqlite*", "**/contact-export*.json", "**/.aws/**", "**/.codex/**", "**/.agents/**"] },
  },
  build: { target: "es2022" },
});
