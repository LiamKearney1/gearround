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

## Files

- `index.html`: page shell and bottom tab bar
- `styles.css`: all styling (light and dark mode)
- `app.js`: sample data, filters and the four pages

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
