# Caffeine ☕

A neumorphic-styled coffee ordering web app built with React 19, Vite, Tailwind CSS v4, and GSAP 3.15.

## Features

- **Landing page** – Hero section with drink cards, scroll reveals, and parallax effects (GSAP)
- **Auth system** – Login/signup with localStorage-based user persistence
- **Menu browsing** – Category filters, search bar, dietary tags and filter chips
- **Drink customization** – Size, milk, sugar level, espresso shots, syrup, temperature/ice with smart defaults per drink category
- **Order flow** – Add to cart with fly animation, mobile drawer, desktop sidebar
- **Cart management** – Quantity adjust, remove with undo toast, reorder last order
- **Confetti** – Burst animation on order confirmation
- **Dark mode** – CSS custom properties with `[data-theme="dark"]`
- **Loyalty program** – Buy 9 drinks, get 10th free (stamp card)
- **Favorites** – Heart-toggle per menu item
- **Pickup time** – ASAP / 15 min / 30 min / 1 hour selector
- **Accessibility** – Focus trap on modals, ARIA labels, keyboard navigation
- **Responsive** – Mobile-first with adaptive cart (drawer on mobile, panel on desktop)

## Tech Stack

| Tool | Version |
|---|---|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 |
| GSAP | 3.15 |
| ESLint | 9 |
| React Router | 7 |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Routes

| Path | Page | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/login` | Login / Sign up | Public |
| `/menu` | Ordering app | Requires login |

## Project Structure

```
src/
├── components/     # React components
├── data/           # Menu data, auth helpers
├── hooks/          # useLocalStorage, useFocusTrap
├── pages/          # LandingPage, LoginPage
├── App.jsx         # Main app (ordering)
├── main.jsx        # Entry point with router
└── index.css       # Global styles, CSS variables
```

## Design

- **Colors**: Warm coffee tones (beige, brown, cream)
- **Typography**: Playfair Display (serif), Space Grotesk (sans), Space Mono (mono)
- **UI**: Neumorphic cards, soft shadows, pill-shaped buttons
