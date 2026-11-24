![Preview](docs/preview/homepage.gif)

# SOLACE — Intelligent Audio

SOLACE is an e-commerce website for a fictional brand of intelligent headphones and earbuds: wireless audio that plays music, answers questions, translates live, remembers what matters, and can be tuned to the listener's hearing. It is written for design-minded buyers who want premium audio without the screen-first habits of a phone. The site is original: the brand, product concept, copy, images and code are all new.

## Pages

| File | Contents |
| --- | --- |
| `index.html` | Home. Intro preloader, hero, word-by-word manifesto with a film modal, "A day with SOLACE" clock carousel, product configurator, "Timeless Design" grid, Listening Graph canvas, portrait manifesto, sticky "What you will love", horizontal feature carousel, testimonials, product details, Hearing Profile hero and bottom sheet |
| `over-ear.html` | Over-ear headphones collection: six models in a 3×2 grid with lifestyle hover and color swatches |
| `in-ear.html` | In-ear earbuds collection, same template |
| `product-<model>-headphones.html` ×6 | Product page for each over-ear model (Bergen, Lyon, Porto, Sendai, Tallinn, Verona): gallery with fullscreen view, finish, size and tuning choices, add to cart, story, specs, scroll reveal text, 3-up carousel, Listening Graph, in-the-box image, FAQ, related products |
| `product-<model>-earbuds.html` ×6 | The same product template for each earbud model |
| `technology.html` | Chapters on the Listening Graph, SOLACE AI, the assistant, privacy and audio |
| `company.html` | Image mosaic, "Two Ears. One Silence.", founder bios |
| `hearing-profile.html` | How hearing profiles work: three steps and an FAQ |
| `retailer.html` | Six listening-room locations plus partner programmes |
| `support.html` | Live FAQ search, Quick Guide, Browse by Topic, FAQ, help cards |
| `orders-shipping.html` | Shipping, returns and warranty (`#warranty-policy`) |
| `contact.html` | Contact cards and a validated contact form |
| `privacy-policy.html`, `terms.html`, `cookies.html`, `accessibility.html` | Legal pages (placeholder text) |

## Features and interactions

- **Intro:** on the first visit of each session a black preloader shows a sparkle, then stacked letters S / OL / ACE, then a small window that grows into the hero.
- **Hero:** the giant SOLACE wordmark sits *behind* the model's head. A cut-out of the photo is layered over the wordmark. There is grain, staggered text reveals and a slight zoom on scroll.
- **Header:**
  - On scroll the MENU pill shrinks to a black square.
  - Labels roll on hover.
  - The menu slides down as a panel with collection cards and a dimmed overlay. On mobile it is a full-screen list.
- **Cart:** a slide-in sidebar. Items are added from the configurator or a product page. Quantity and remove controls work, and the cart is saved in `localStorage`.
- **Other states:** an account sidebar (validated, no submit), a cookie banner (remembers your choice), the "Hearing profile made simple" bottom sheet, a film modal with captions and a progress bar, a fullscreen product lightbox, FAQ accordions, collection tabs and support search results.
- **Scroll effects:** smooth wheel scrolling on desktop, word-by-word manifesto reveal, a sticky feature list with a progress line, a horizontal carousel driven by scroll, a portrait that un-clips into view, and parallax images.
- **Canvas:** the Listening Graph is a hand-written 2D canvas that grows its branches as you scroll and leans toward the cursor.
- **Responsive:** measured layouts for 1440 px desktop and 390 px mobile, with no horizontal overflow.
- **Reduced motion:** with `prefers-reduced-motion`, animations and smooth scrolling are turned off.
- **Sound:** there is no sound.

## Technology

Native HTML, CSS and JavaScript only, with no framework, build step or server. The fonts come from Google Fonts:
- **Newsreader** (300/400, italic) for serif text.
- **Zalando Sans** (400/500/700) for UI and body text.

## Running it

Open `index.html` in a browser by double-clicking it. Everything works over `file://`. An internet connection is needed only for the web fonts. The intro plays once per browser session. To see it again, open a new tab or window.

## Folder structure

```
.
├── index.html
├── over-ear.html, in-ear.html
├── product-{bergen,lyon,porto,sendai,tallinn,verona}-{headphones,earbuds}.html   (12 files)
├── technology.html, company.html, hearing-profile.html, retailer.html, support.html
├── orders-shipping.html, contact.html
├── privacy-policy.html, terms.html, cookies.html, accessibility.html
├── css/style.css
├── js/main.js
├── assets/img/          70 AI-generated .jpg files + hero-cut.png (hero cut-out)
├── docs/preview/        homepage.gif, hero.png
└── README.md
```

## Editing content and assets

There is no generator or build step. To change something, edit the files directly.
- **Text:** in each `.html` file. Shared parts (header, menu, cart and account panels, cookie banner, footer) are repeated in every page. To change one of them everywhere, use find-and-replace across all `.html` files.
- **Colors and fonts:** CSS variables at the top of `css/style.css` (`--black`, `--white-2`, `--product-bg`, `--blue`, `--serif`, `--sans`).
- **Sizes:** sizes are written as `calc(N * var(--p))`. `--p` equals 1 px at 1440×900 and scales with the viewport.
- **Images:**
  - Replace a file in `assets/img/` with another image of the same name. Any aspect ratio works because images are cropped with `object-fit: cover`.
  - The hero uses two files: `hero-1.jpg` is the background and `hero-cut.png` is the same photo with a transparent background, which is what places the head in front of the wordmark. If you change the hero, make a new cut-out as well.
- **Prices and options:** the `data-price` and `data-name` attributes on `.pdp` in each product page, and the visible text next to them.
- **Interactions:** everything is in `js/main.js`, grouped by section with comments.

## Placeholders to replace

- The brand name SOLACE, the "Intelligent Audio" tagline and the "Prix Sonore 2026 nominee" badge
- The emails `hello@`, `partners@`, `privacy@`, `legal@` and `access@solace.audio`
- Retailer names and addresses (Hollis & Grey), founder names (Ines Calloway, Theo Marchetti), testimonials (Daniel, Maya)
- Prices, specifications, payment marks in the footer and social links (`#`)
- All legal text, which is placeholder copy and is not reviewed

## Credits and licenses

- **Images:** all photos and product images were generated with AI (Nano Banana via Google Flow) for this project. They do not show real people or real brands.
- **Video and sound:** none are used. The film modal is a slideshow of the generated images.
- **Fonts:** Newsreader and Zalando Sans from Google Fonts, under the SIL Open Font License.
- **Icons:** drawn by hand as inline SVG.

## Known limitations

- The 3D WebGL product viewer and the three.js memory graph are approximated. The configurator crossfades between product photos per color, and the graph is a custom 2D canvas.
- Videos (hero, "A day with", feature cards, film) are replaced with still AI images that use slow zoom and crossfades.
- Checkout, sign-in, newsletter and contact forms only validate input. Nothing is sent anywhere.
- The hero cut-out was made automatically by color keying, so fine hair edges are softened.
