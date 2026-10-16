# GearRound

A mobile-first website for buying, selling, trading and giving away used youth sports gear near you.

It is plain HTML, CSS and JavaScript with no build step, so you can open `index.html` directly or upload the folder to any static host.

## Pages

| Tab | What it does |
|---|---|
| **Marketplace** | Scrollable feed of listings with price, item info, seller name and location, listing type (Sale / Give-away / Trade) and delivery (Shipped / In person). Quick filter chips and a "near me" distance setting. |
| **Search** | Search bar plus grouped filters: listing type, delivery, condition (New → Well loved) and distance with a map preview. "Show N results" opens the filtered Marketplace. |
| **Messages** | Text-message style inbox split into **Getting** and **Giving**, with unread markers. |
| **Profile** | Profile, location, preferences (shipping/in person, sports, ages), saved listings and a **+** button for creating a listing. |

Filters are shared between Marketplace and Search, and saved listings and preferences are remembered in the browser.

## Current limitations

All listings, people and messages are sample data. There are no accounts, no real messaging, and the **+**, Edit profile and conversation buttons show a "coming soon" note. Those need a backend (for example Supabase or Firebase).

## Install it as an app (PWA)

GearRound is a Progressive Web App. Once the site is live (see below), people can add it to their home screen and it opens full screen like a regular app, even with no internet.

- **iPhone (Safari):** tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** tap the **Install app** prompt, or open the **⋮** menu and choose **Install app**.
- **Computer (Chrome or Edge):** click the install icon at the right end of the address bar.

Installing needs the site to be served over HTTPS (GitHub Pages does this). It won't install from a file opened directly on your computer.

**When you change the site:** run this from the repo folder before you commit:

```sh
node tools/stamp.mjs
```

It handles cache busting:
- It adds a short fingerprint of each file's contents to the CSS and JS links in `index.html` (for example `styles.css?v=1666c4eb`), so browsers download the new file instead of reusing an old saved copy.
- It updates the service worker's file list and `VERSION` to match, so installed apps pick up the change.

If you add a new file the app needs offline (like a listing photo), add it to the `SHELL` list in `sw.js` first. If you skip the script, installed copies keep showing the old version.

**How people get updates:** each time the app is opened or brought back to the foreground, it checks for a new version. When one has downloaded, a banner appears: "A new version of GearRound is ready." **Refresh** reloads into the new version right away. **Later** hides the banner, and the update applies the next time the app is fully closed and reopened.

## Files

- `index.html`: page shell and bottom tab bar
- `styles.css`: all styling (light and dark mode)
- `app.js`: sample data, filters and the four pages
- `manifest.webmanifest`: app name, colors and icons used when installing
- `sw.js`: service worker that caches the app so it works offline
- `tools/stamp.mjs`: cache-busting script (run after changes)
- `icons/`: app icons (`icon.svg` is the source; the PNGs are generated from it)

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publish with GitHub Pages

1. In this repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/ (root)**, then **Save**.
4. After a minute the site is live at `https://liamkearney1.github.io/gearround/`.
