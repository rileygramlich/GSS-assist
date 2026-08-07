# Jimmy — landing page

Marketing site for the AI receptionist, deployed to **reception.rileygramlich.dev**.
Separate from the assistant runtime: nothing here ships in the Docker image, and
`site` is listed in the repo's `.dockerignore`.

Create React App + plain CSS, matching the design system in `../style.md`.
Tokens in `src/index.css` are copied verbatim from the main site so the two stay
visually identical.

## Run it

```bash
cd site
npm install
npm start
```

## Deploy

Served from the same VPS as the assistant, behind the Traefik that already runs
there — no GitHub Pages, no public repo, no plan upgrade. It is its own compose
project at `/opt/jimmy-site`, so rebuilding the site can never interrupt a call.

The bundle is built inside Docker (multi-stage: node builds, nginx serves), so
only the source has to reach the box — no `node_modules`, no committed build.

```bash
cd /opt/jimmy-site && docker compose up -d --build
```

DNS at the registrar for rileygramlich.dev — an A record straight at the VPS,
not a CNAME, since it points at the host rather than a platform:

```
A   reception   89.116.50.112
```

Traefik requests the certificate once that resolves. `public/CNAME` is left in
place only so a future move to GitHub Pages stays a one-step change; nginx
ignores it.

To ship changes, regenerate `../site-bootstrap.sh` and paste it on the VPS, or
copy the source up directly if you have working SSH.

## Before it goes live

Everything unwritten sits in `src/content.js`, marked `PLACEHOLDER`:

- `BOOKING_URL` — every CTA points here
- `TIERS` — names, prices, setup fees, included lists
- First two entries in `FAQS` — overage terms and contract terms

Grep for `PLACEHOLDER` to find them all:

```bash
grep -rn PLACEHOLDER src/
```

No stats, client counts, or testimonials are invented anywhere. If you want a
number on the page, it has to be a real one you can stand behind.
