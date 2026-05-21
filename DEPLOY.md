# Deploying cortadomic.com to Hostinger

This is a 100% static Astro site. There is **no Node runtime in production** — Hostinger just serves the contents of the `dist/` folder over its standard web server. That's it.

---

## TL;DR (when nothing has changed structurally)

```bash
npm install            # only if package.json changed
npm run build          # writes the production site to dist/
```

Then upload **everything inside `dist/`** to your Hostinger `public_html/` folder (replacing what's there).

That's the whole deploy. Sections below cover image updates, first-time setup, and the polish (HTTPS, redirects, caching).

---

## Standard build & deploy

### 1. Build locally

From the project root:

```bash
npm run build
```

You should see output ending in `Complete!` and `9 page(s) built`. The `dist/` folder is your deploy artifact. Total size is around 9 MB.

### 2. Upload `dist/` to Hostinger

You have three reasonable ways. Pick whichever is easiest for you.

**Option A — hPanel File Manager (easiest, one-time setup, no SSH needed):**

1. Log in to Hostinger → hPanel → **Files → File Manager**.
2. Navigate to `public_html/`.
3. Select all existing files and **delete** them.
4. Click **Upload Files**, select **everything inside your local `dist/` folder** (NOT the `dist` folder itself — the contents). The upload supports drag-and-drop of folders too.
5. Wait for the upload to finish, then visit https://www.cortadomic.com/ to verify.

**Option B — FTP/SFTP (best for repeat deploys):**

1. hPanel → **Files → FTP Accounts** → use the existing FTP user, or create a dedicated one.
2. In FileZilla / Cyberduck / WinSCP, connect to the FTP host shown in hPanel.
3. Set local directory to `dist/`, remote directory to `public_html/`.
4. Sync the local `dist/` contents to remote `public_html/` (overwrite existing). Make sure the remote `.htaccess` (see below) is preserved.

**Option C — SSH + rsync (only if you have a Hostinger Business / Cloud plan with SSH):**

```bash
# from the project root, after npm run build:
rsync -avz --delete --exclude='.htaccess' dist/ \
  USER@HOST:domains/cortadomic.com/public_html/
```

### 3. Smoke test

After upload, walk through these URLs in an incognito window:

- https://www.cortadomic.com/ — hero carousel rotates, all 5 slides load
- https://www.cortadomic.com/products/cortado-xe/ — gallery shows 7 images
- https://www.cortadomic.com/products/cortado-mkiii/ — gallery shows 10 images
- https://www.cortadomic.com/compare/ — Xe / MkIII tabs work
- https://www.cortadomic.com/applications/ — all 6 sections render
- https://www.cortadomic.com/dealers/ — full dealer list
- https://www.cortadomic.com/video-audio/ — MkIII YouTube embed plays
- https://www.cortadomic.com/contact/ — contact form submits and shows success message
- https://www.cortadomic.com/sitemap-index.xml — sitemap loads

In Chrome/Edge DevTools → Network, image requests should show `Type: avif` (proves the `<picture>` AVIF/WebP fallbacks are working).

---

## When images change

The `public/images/` files are the **source of truth**. The optimization pipeline emits `.webp` and `.avif` siblings for each one.

### Add a new image

1. Drop the original (jpg or png) into `public/images/products/` (or wherever).
2. Reference it from a JSON content file or a `.astro` page using a `<Picture>` component:
   ```astro
   <Picture src="/images/products/my-new-shot.jpg" alt="..." />
   ```
3. Run:
   ```bash
   npm run optimize:images
   ```
   This:
   - Resizes anything wider than 2000px down to 2000px
   - Re-encodes the original at high-quality JPEG (mozjpeg q=82) or PNG (palette)
   - Emits `my-new-shot.webp` and `my-new-shot.avif` siblings
   - Skips images whose source file hasn't changed (cached in `scripts/.image-cache.json`)
4. `npm run build`
5. Upload `dist/` as usual.

### Re-process every image (force rebuild)

```bash
npm run optimize:images -- --force
```

### Convert a heavy PNG to JPG

Only useful if the PNG is opaque (no real transparency) and large. Use any image editor, save the new `.jpg` next to the old `.png`, delete the old PNG and its `.webp`/`.avif` siblings, update references in the JSON / Astro file, then re-run `optimize:images` and `build`.

---

## When content changes

Product info (price, specs, gallery list, In-the-Box, downloads, etc.) lives in `src/content/products/cortado-xe.json` and `cortado-mkiii.json`. Edit those, then `npm run build` and re-upload.

Dealer list lives in `src/content/dealers.json`. Same flow.

Site-wide settings (company name, address, contact email, OG image) live in `src/content/site.json`.

PDF documents go in `public/docs/`. They are referenced from product JSON via `documents[].url`.

---

## Contact form (Web3Forms)

The `/contact/` page sends mail through **[Web3Forms](https://web3forms.com)** — a third-party relay. Submissions are delivered to `info@zeppelindesignlabs.com`. The dependency is recorded in `src/content/site.json` under `contactForm`.

### One-time setup

1. Go to [web3forms.com](https://web3forms.com) and enter **info@zeppelindesignlabs.com** to receive an access key.
2. **Local dev:** copy `.env.example` → `.env` and set `PUBLIC_WEB3FORMS_ACCESS_KEY=your-key`.
3. **GitHub Pages:** repo → **Settings → Secrets and variables → Actions** → add `WEB3FORMS_ACCESS_KEY` with the same value (the deploy workflow maps it at build time).
4. **Hostinger (manual build):** set the same variable in `.env` before `npm run build`, or export it in your shell.

The access key is baked into the static JS at build time. If the form stops working, check Web3Forms first (quota, key rotation) — details are always in `site.json → contactForm`.

Free tier: 250 submissions/month. No login required after the initial key email, but save the key somewhere safe.

---

## GitHub Pages deploy

Repo: **https://github.com/ZeppelinDesignLabs/cortadomic.com**

Every push to `main` runs `.github/workflows/deploy.yml` — builds Astro and publishes `dist/` to GitHub Pages. No FTP upload needed.

### One-time GitHub setup (do this once in the browser)

1. Open **https://github.com/ZeppelinDesignLabs/cortadomic.com/settings/pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. Open **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `WEB3FORMS_ACCESS_KEY`
   - Value: your Web3Forms access key (contact form; site builds without it, but the form stays disabled)
4. Trigger the first deploy:
   - **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**,  
   - or push any commit to `main`.
5. Wait for the workflow to finish (green check). The workflow deploys successfully, but **do not use** `https://zeppelindesignlabs.github.io/cortadomic.com/` as your real site URL — CSS and images break there because this project is configured for a **custom domain at the site root**, not a GitHub project subpath. Proceed to custom domain setup below.

> **Why the github.io URL looks broken:** Astro emits asset paths like `/assets/...` and `/images/...`. On `github.io/cortadomic.com/` the browser requests `github.io/assets/...` (wrong) instead of `github.io/cortadomic.com/assets/...`. On `www.cortadomic.com` those paths resolve correctly. No code change needed — use the custom domain.

> **Org repos:** If Pages is disabled, an org owner may need **Organization settings → Pages → Allow GitHub Pages for this organization**.

### Custom domain (`www.cortadomic.com`)

The repo already includes `public/CNAME` → `www.cortadomic.com` (copied into `dist/` on build). `astro.config.mjs` declares `site: 'https://www.cortadomic.com'`.

#### Step 1 — Register domain in GitHub (do this first)

1. **Settings → Pages → Custom domain** → enter `www.cortadomic.com` → **Save**.
2. GitHub will show “DNS check unsuccessful” until public DNS exists — that’s OK for HOSTS testing below.
3. Ensure **`WEB3FORMS_ACCESS_KEY`** is set under **Settings → Secrets → Actions**, then push or re-run the deploy workflow so the contact form is baked into the build.

#### Step 2 — Test locally before changing public DNS (HOSTS file)

Point your **own computer only** at GitHub Pages so `www.cortadomic.com` resolves to the deployed site. Everyone else still uses real DNS until you update the registrar.

**Windows** — edit as Administrator:

`C:\Windows\System32\drivers\etc\hosts`

Add these lines:

```
185.199.108.153 www.cortadomic.com
185.199.108.153 cortadomic.com
```

**macOS / Linux** — edit `/etc/hosts` with the same lines.

Then:

1. Flush DNS cache (Windows PowerShell as admin: `ipconfig /flushdns`)
2. Visit **http://www.cortadomic.com/** (HTTP first — HTTPS may not certificate until public DNS is configured)
3. Confirm CSS, images, and navigation work
4. Test **http://www.cortadomic.com/contact/** — submit the form; mail should arrive at `info@zeppelindesignlabs.com`
5. Remove or comment out the HOSTS lines when done testing (or leave until you cut over DNS)

> **HTTPS note:** GitHub provisions the Let’s Encrypt cert after public DNS points at GitHub. With HOSTS-only testing, use HTTP or expect a certificate warning on HTTPS until DNS is live and **Enforce HTTPS** is enabled in Pages settings.

#### Step 3 — Go live (public DNS)

At your DNS host (where `cortadomic.com` is registered):

| Type | Name | Value |
|------|------|-------|
| **CNAME** | `www` | `zeppelindesignlabs.github.io` |

For apex `cortadomic.com` (no www): redirect to www at your registrar, or use GitHub’s [apex A records](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain).

After DNS propagates:

1. GitHub **Settings → Pages** — DNS check should turn green
2. Enable **Enforce HTTPS**
3. Remove HOSTS overrides if still present
4. Smoke-test **https://www.cortadomic.com/**

### Ongoing deploys

```bash
git add .
git commit -m "your message"
git push origin main
```

Check progress under **Actions**. Typical build time: ~1–2 minutes.

### Smoke test (GitHub Pages)

Same URLs as Hostinger (step 3 above), but use your GitHub Pages URL or `https://www.cortadomic.com/` after DNS is live. Also verify `/contact/` form submission if `WEB3FORMS_ACCESS_KEY` is set.

---

If this is the first time the site has been hosted on Hostinger:

### Domain & HTTPS

1. hPanel → **Domains** → make sure `cortadomic.com` is connected to this hosting plan and **www.cortadomic.com** redirects to (or from) the apex — pick one canonical host. The site config (`astro.config.mjs`) declares `https://www.cortadomic.com` as canonical, so the easiest path is **redirect apex → www**.
2. hPanel → **SSL** → enable Let's Encrypt for both `cortadomic.com` and `www.cortadomic.com` and force HTTPS.
3. Wait for the cert to provision (a few minutes).

### `.htaccess` for clean URLs, gzip/brotli, and long-cache for hashed assets

Astro emits trailing-slash URLs (`/products/cortado-xe/`) and Hostinger's Apache will serve `index.html` automatically for those. So you don't strictly need URL-rewrite rules. But you do want compression and aggressive caching for the static assets. Drop this `.htaccess` file at `public_html/.htaccess`:

```apache
# Force HTTPS + canonical www host
RewriteEngine On
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^cortadomic\.com$ [NC]
RewriteRule ^(.*)$ https://www.cortadomic.com/$1 [R=301,L]

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/xml text/plain
  AddOutputFilterByType DEFLATE application/javascript application/json application/xml
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/xml text/plain
  AddOutputFilterByType BROTLI_COMPRESS application/javascript application/json application/xml
  AddOutputFilterByType BROTLI_COMPRESS image/svg+xml
</IfModule>

# Cache headers
<IfModule mod_expires.c>
  ExpiresActive On
  # HTML: must revalidate so deploys propagate
  ExpiresByType text/html "access plus 0 seconds"
  # Long-cache static assets (Astro fingerprints CSS/JS filenames)
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>

<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=0, must-revalidate" "expr=%{REQUEST_URI} =~ m#\.html$#"
  Header set Cache-Control "public, max-age=31536000, immutable" "expr=%{REQUEST_URI} =~ m#\.(css|js|avif|webp|jpg|jpeg|png|svg|woff2)$#"
</IfModule>

# Optional: serve plain extensionless URLs if anyone hits them
DirectoryIndex index.html

# Custom 404
ErrorDocument 404 /404.html
```

The 301 redirect at the top is the important one — without it, `cortadomic.com` and `www.cortadomic.com` both resolve and you split SEO authority.

> **Note:** If you don't want to maintain a 404 page right now, delete the `ErrorDocument 404 /404.html` line and Hostinger will use its default. The site doesn't currently include a `404.html`. Building one is a future polish item.

### DNS sanity check

```bash
nslookup www.cortadomic.com
nslookup cortadomic.com
```

Both should resolve to your Hostinger server IP. If you just changed nameservers, give it 24 hours.

---

## SEO & search (post-launch checklist)

The site ships with per-page titles/descriptions, canonical URLs, Open Graph/Twitter cards, JSON-LD (Organization, LocalBusiness, Product, Video, FAQ, Blog), `robots.txt`, XML sitemap with image entries, legacy 301 redirects, `/blog/` + RSS, and `/about/`.

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add property **`https://www.cortadomic.com/`** (URL-prefix is simplest).
3. Verify ownership:
   - **DNS TXT** at your registrar (recommended), or
   - Drop Google's HTML verification file in `public/` and redeploy.
4. Under **Sitemaps**, submit: `https://www.cortadomic.com/sitemap-index.xml`
5. **URL Inspection** — request indexing for:
   - `/`
   - `/products/cortado-mkiii/`
   - `/products/cortado-xe/`
   - `/compare/`
   - `/applications/`
   - `/blog/`
6. After DNS points to GitHub Pages, confirm **HTTPS** is valid and no crawl errors on legacy URLs (`/spec-and-documents/`, old PDF paths).

### Bing Webmaster Tools

1. [Bing Webmaster Tools](https://www.bing.com/webmasters) — add site, verify, submit the same sitemap URL.

### Google Analytics (optional)

1. Create a GA4 property for `www.cortadomic.com`.
2. In `src/content/site.json`, set `analytics.ga4MeasurementId` to your measurement ID (e.g. `G-XXXXXXXXXX`).
3. Rebuild and deploy. A consent banner loads GA only after the visitor accepts analytics cookies.

### Regenerate SEO assets after image changes

```bash
npm run generate:og          # 1200×630 Open Graph cards in public/images/og/
npm run generate:dimensions  # width/height map for Picture CLS hints
```

---

## Rollback

The `dist/` folder is fully self-contained, so the safest rollback is to keep one or two prior `dist/` folders zipped on your local machine before each deploy:

```bash
# Before deploying:
Compress-Archive -Path dist\* -DestinationPath ..\cortadomic-dist-2026-05-15.zip
```

If a deploy goes sideways, upload the contents of the previous zip back to `public_html/`.

---

## Local commands reference

```bash
npm run dev              # local dev server, hot reload, http://localhost:4321/
npm run build            # production build to dist/
npm run preview          # serve dist/ locally to smoke-test before upload
npm run optimize:images  # regenerate AVIF/WebP/optimized originals (only changed files)
```
