# Balaji Earthmovers — Production Deployment Package

This directory (`deploy/`) contains the self-contained, production-ready build for **Balaji Earthmovers** with all SEO, GEO SEO, AEO (Answer Engine Optimization), Google Search Console verification, and Schema graph markup fully configured.

---

## What is inside this folder:
- **`index.html`**: Complete website with full SEO, GEO meta tags, OpenGraph, Twitter Cards, Google Search Console verification, and Rich JSON-LD schemas (GeneralContractor, FAQPage, VideoObject, Breadcrumbs).
- **`googleb9519ecd696ef985.html`**: Google Search Console site ownership verification file.
- **`favicon.ico`**, **`apple-touch-icon.png`**, **`favicon-32x32.png`**, **`favicon-16x16.png`**: Multi-resolution favicons and iOS touch icons.
- **`404.html`**: Custom industrial 404 page with navigation, hotline, and `noindex, follow` directive.
- **`style.css`**: Production styles including the MMR regional coverage section and mobile responsiveness.
- **`app.js`**: Interactive behavior (counters, filters, video reel tabs, lightbox modal, Netlify form enquiry validation).
- **`sitemap.xml`**: XML Sitemap with high-priority URLs, video and image metadata.
- **`robots.txt`**: Search engine and AI crawler directives allowing Google, Bing, Perplexity, GPTBot, and Claude.
- **`images/`**: Optimized WebP visuals, brand marks, and site graphics.
- **`video/`**: On-site running work video MP4 assets.
- **`server.js`**: Lightweight Node.js server with HTTP range streaming for video playback and standard icon routing.
- **`_redirects`**: 404 rewrite rules and Google verification rules for Netlify and Cloudflare Pages.
- **`vercel.json`**: Edge caching, clean URLs, and rewrite rules for Vercel.

---

## Instant Deployment Methods:

### Option 1: Netlify (Drag & Drop or CLI — Recommended)
1. Login to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop this `deploy` folder directly into Netlify Drop.
3. Attach your custom domain: `balajiearthmoversmumbai.com`.
4. Netlify will automatically detect Netlify Forms (`estimate-enquiry`) and route 404s via `_redirects`.

### Option 2: Vercel (Fast Global Edge)
1. Install Vercel CLI (`npm i -g vercel`) or visit [vercel.com](https://vercel.com).
2. Run `vercel deploy` inside this `deploy` directory:
   ```bash
   cd deploy
   vercel --prod
   ```
3. Attach your custom domain: `balajiearthmoversmumbai.com`.

### Option 3: Traditional Web Host (cPanel, Hostinger, GoDaddy, Bluehost)
1. Zip the contents of the `deploy` folder.
2. Open cPanel > **File Manager** > `public_html/`.
3. Upload and extract the files directly into `public_html/`.

### Option 4: Linux VPS / Nginx / Apache
Point the root `root /var/www/balajiearthmovers;` to this `deploy/` directory.

### Option 5: Node.js (Render, Railway, VPS)
Run the built-in HTTP server:
```bash
node server.js
```
The server binds to `PORT 3000` (or `process.env.PORT`).

---

## 🏢 Contact & Head Office
- **Balaji Earthmovers**
- **Domain**: [https://balajiearthmoversmumbai.com](https://balajiearthmoversmumbai.com)
- **Address**: 604/605, B Wing, Shree Kedarnath Co-op. CHS, Opp. Gokul Anand Hotel, Overi Pada, Near W.E. Highway, Dahisar (East), Mumbai — 400068
- **Direct Desk**: +91 93203 20445 (Call & WhatsApp)
- **Email**: balaji_transport5268@yahoo.com | balajiearthmovers5268@gmail.com
