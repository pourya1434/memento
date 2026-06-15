# Personal Website

A cozy personal site for notes on programming, art, and literature — in English
and Persian (Farsi). Posts support Markdown, code blocks, cover images, and
shared files including a SoundCloud-style music player.

- **Authoring:** Django + Django REST Framework admin (runs **locally only**)
- **Site:** React + Vite + Tailwind, built to **static files**
- **Hosting:** GitHub Pages — **free, no server**

## How it works (important)

GitHub Pages can only serve static files — it can't run Django. So there is
**no admin dashboard on the live website**. Instead:

> You write posts in the Django admin **on your own computer**, run one command
> to export everything to static JSON + media, then push to GitHub. A GitHub
> Action rebuilds and publishes the site.

```
 Django admin (local)  ──export_static──▶  static JSON + media  ──git push──▶  GitHub Pages
   write your post                          in frontend/public/                  live site
```

---

## One-time setup

### 1. Backend (the authoring tool)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # fish: source venv/bin/activate.fish
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # create your admin login
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. GitHub Pages (do once)

1. Push this project to a GitHub repo on the `main` branch.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

> Using a `<username>.github.io` repo (served at the root)? Edit
> `.github/workflows/deploy.yml` and set `VITE_BASE: /`.

---

## ✍️ Writing & publishing a post — the workflow

This is the loop you'll repeat every time you post:

```bash
# 1. Start the local admin
cd backend
source venv/bin/activate
python manage.py runserver
#    → open http://127.0.0.1:8000/admin/  and log in
```

In the admin you can:
- **Add a Post** — title, category, language (English/Persian → sets font + RTL),
  excerpt, Markdown body (use ``` fences for code), and an optional cover image.
- **Add Attachments** to a post — music/audio (gets the player), images, books,
  or downloadable files.
- **Manage Categories** — these show up in the sidebar.
- Leave **“is published” unchecked** to keep a post as a draft (it won't be
  exported).

```bash
# 2. Export your content to the static site
python manage.py export_static
#    → writes JSON to frontend/public/data/ and copies media to frontend/public/media/

# 3. (Optional) preview the static site exactly as it will deploy
cd ../frontend
npm run build && npm run preview

# 4. Publish
cd ..
git add -A
git commit -m "New post: <title>"
git push
#    → the GitHub Action builds & deploys automatically (~1–2 min)
```

That's it — refresh your live site and the post is there.

### Previewing while you write (live)

For a faster authoring preview without rebuilding each time, run the dev server
in another terminal. Re-run `export_static` whenever you want it to pick up new
content, then refresh:

```bash
cd frontend
npm run dev        # http://localhost:5173
```

---

## Project structure

```
backend/                    Django authoring tool (local only)
  blog/                     models, admin, serializers, REST API
  blog/management/commands/
    export_static.py        ← exports posts/categories/media to the frontend
  config/                   settings, urls
frontend/                   React + Vite + Tailwind site
  src/                      app, pages, components (music player, markdown, …)
  src/api.js                reads the exported static JSON (no server)
  public/data/              generated post/category JSON  (committed)
  public/media/             your uploaded music/images/files (committed)
.github/workflows/deploy.yml  builds & deploys to GitHub Pages on push to main
```

## Notes

- **Persian / RTL** works end to end: the `language` field drives the font and
  text direction per post, and Persian slugs export fine.
- **Music seeking** works on GitHub Pages — its CDN supports HTTP range
  requests, so the player can jump around the track.
- **Media size:** uploaded files are committed to the repo. That's free and
  simple; GitHub recommends keeping repos under ~1 GB. If your music library
  gets large, media can be moved to cloud storage (S3 / Cloudflare R2) later.
- **Deleting a post:** delete it in the admin, re-run `export_static` (it clears
  the old data first), then commit & push.
- The Django backend is an **authoring tool only** — it is never deployed.
