# Sculpt Gym website

The website for Sculpt Gym, Bulawayo (sculptgym.co.zw). It is a copy of the original Sitejet site, rebuilt as a static page and hosted free on GitHub Pages.

## Ground rules

- The look must stay as it is: the owner approved the Sitejet design plus the scroll effects described below. Do not restyle, modernise or "tidy" anything unless the owner asks for that specific change.
- Edit `index.html` directly. There is no build step and no framework. Committing to `main` publishes the site: the workflow in `.github/workflows/pages.yml` deploys it to GitHub Pages in about a minute.
- Keep Sitejet's class names and `ed-...` ids. The styles depend on them.
- The owner is not a developer. Explain changes in plain words.

## Files

- `index.html`: the whole page. Text, layout, styles and the site's own scripts are all in this one file.
- `images/`: photos and icons. Photos shown on the page have an AVIF copy (`.avif`, about 40% smaller, checked to be visually identical) that browsers use first through `<picture>`; the `.webp`/`.jpg` file is the fallback. When replacing a photo, replace both, or delete the old `.avif` and its `<source>` line. `team-N-576.avif` is the smaller team card sent to phones. `team-N.jpg` is a team card in the slider and `team-N-large.webp` is the full-size version opened on click. `gallery-NN.webp` is a gallery thumbnail (800px wide) and `gallery-NN-large.webp` is its full-size version (1200px). `hero-NN.webp` are banner slideshow photos. `about.webp` is the "Welcome" photo.
- `vendor/`: unchanged copies of jQuery 3.7.1, slick 1.8.1 (sliders) and Magnific Popup 1.1.0 (photo lightbox). Do not edit.
- `fonts/`: the Font Awesome icon font used by the slider arrows.
- `js/light-trace.js`: the travelling-light effect, shared by both pages. Add `data-light-trace` to any element to give it the light.
- `en/`, `sn/`, `zu/`: redirects, so old links to sculptgym.co.zw/en, /sn and /zu still work.
- `salon/`: the Sculpt Gym Salon page (sculptgym.co.zw/salon/), a second business run by Susan inside the gym. `salon/index.html` is self-contained, with its own lilac and plum styling, its fonts in `salon/fonts/` (free OFL fonts: Josefin Sans, Montserrat, Great Vibes) and its photos in `salon/images/`. The current photos are small crops of the salon's AI-made poster (`price-list.webp`, also offered as a download as `price-list-share.jpg`); replace them with real photos when the owner supplies them, keeping the file names or updating the `src` attributes. Light effects on the salon page: the booking card has the same travelling light (`data-light-trace`, drawn by `../js/light-trace.js`); `.meteor` elements are the shooting stars in the opening banner; `.glow-pulse` gives a button a breathing glow. All of them switch off for visitors whose phone or computer asks for reduced motion.

## Where things are in index.html

Search for these ids or words to find each part.

1. Two `<style>` blocks in the head. The first is Sitejet's base theme, minified; leave it alone. The second holds the page's own rules (hero slideshow, spacing), one rule per line.
2. Hero banner: `sculpt-carousel-track` holds the slideshow images. A short script hides each slide until its photo has loaded, so slow photos never show as black gaps. The slideshow lists every image twice ("FULL SET" then "DUPLICATE FOR LOOP"); keep both lists the same so the loop is seamless. The headline is "Transform Your Body".
3. About: `id="about-1"`, heading "Welcome to Sculpt Gym".
4. Services: `id="services-2"`, the three boxes. Directly under the boxes sits the salon preview card, `<a class="salon-teaser">`, which links to `salon/`. Its styles are at the end of the page-specific `<style>` block. The top menu and footer menu also have a "Salon" link. A light with a smoothly fading tail travels round the card's edge. It is drawn by `js/light-trace.js`; its colours, speed and tail length are the `data-light-*` attributes on the card (the script explains each one).
5. Membership prices: the `<table>` after `<h2>Membership</h2>`.
6. Opening hours: `preset-opening-hours-v3-default`, one box per day.
7. "Ready to Start?" banner: `id="cta-1"`.
8. Meet the Team slider: `id="ed-1444356197"`. One `<div class="ed-slider-item bg-cc">` per trainer. To add a trainer, copy a line and point it at new image files.
9. Testimonials: `id="testimonial-2"`. One `ed-slider-item` per testimonial.
10. Gallery: `id="gallery-1"`. One `<li class="ed-gallery-thumb">` per photo.
11. Contact form: `id="contact-us-1"`. Messages are sent by FormSubmit (formsubmit.co) to info@sculptgym.co.zw. The very first message triggers a confirmation email from FormSubmit that must be clicked once.
12. Footer: `id="footer-2"`: address, phone, email, menu and social links.
13. Map: `ed-map`, a Google Maps embed.
14. Scripts at the end: libraries from `vendor/`, then the site script (animations, parallax, sliders, lightbox), then Sitejet's menu script.

## Scroll effects

The owner asked for the page to feel more alive, so it uses the scrollcraft engine (`js/scrollcraft.js`, MIT licence, from github.com/nateherkai/scroll-craft; only its effect rules were taken, not its page-wide styles). The site as it was before this is kept on the branch `before-scroll-effects`.

1. Sections carry `data-sc-act="flow"`; the engine publishes their scroll progress as `--sc-p`. The banner uses it in CSS: the slideshow zooms and darkens and the headline lifts away as you scroll.
2. Section headings build word by word: `data-sc-cue="from to rampIn 0" data-sc-kinetic="words"`. The numbers were measured so each heading finishes just after it enters view on desktop and phone; re-measure if a section's height changes a lot.
3. Content blocks fade up once when they come into view: `data-sc-in`; a parent with `data-sc-stagger="ms"` reveals its children one after another (service boxes, price rows, opening hours).
4. Prices are plain text and do not count up: the owner removed that effect, because a screenshot taken mid-count showed wrong prices. Do not add it back.
5. The welcome photo is wiped in (`data-sc-reveal`) and drifts (`data-sc-parallax`).
6. The gallery is pinned (`data-sc-act="pan" data-sc-span="3.4"`): the section holds while the photo row (`data-sc-pan`) slides sideways, and a small script turns each photo as it crosses the centre. Adding or removing photos works without other changes.
7. Service boxes tilt towards the mouse (`data-sc-tilt`) and the "Join Now" button drifts towards it (`data-sc-magnet`), on computers only.
8. A thin yellow line at the top shows how far down the page you are (`.scroll-progress`).

The styles are in the "Scroll effects" part of the page-specific `<style>` block; the start-up script is at the end of the page, after `js/scrollcraft.js`. Sitejet layout rules fight the gallery pin (stretching, centring, clipping); the overrides for that are commented there.

## Known quirks copied on purpose from the original

- Headings and text show in the browser's default serif font. The original asks for Roboto and Anton but its font file never loaded (Sitejet's font link returned an error), so visitors always saw the fallback. The copy keeps that. Loading the real fonts would be a one-line change, but it changes the look, so only do it if the owner asks.
- "Legal Notice" and "Privacy Policy" link to pages that do not exist, as on the original.
- The three testimonial portraits still load from images.pexels.com, as on the original. Download them into `images/` when possible. (All 15 banner photos are now stored in `images/`, `hero-01` to `hero-15`.)

## Custom domain

The site is served from GitHub Pages. To put it on sculptgym.co.zw, enter it as the custom domain in the repository's Settings > Pages (with the GitHub Actions source no `CNAME` file is needed), then point the domain's DNS at GitHub Pages: A records for `@` to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, and a CNAME record for `www` to `263man.github.io`. Then tick "Enforce HTTPS".

## Checking a change

Serve the folder locally (`python3 -m http.server`) and take Playwright screenshots at 1440, 768 and 390 pixels wide. Compare them with screenshots taken before the change; only the intended part should differ.
