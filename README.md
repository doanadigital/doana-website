# Doana 2.0 Advanced Website

## Pages
- index.html — Home
- about.html — About
- feedback.html — Client testimonials + feedback form
- contact.html — Contact

## Add your real logo
Put your logo in:
assets/logo.png

Recommended:
- PNG with transparent background
- Square or horizontal mark
- At least 300px wide

## Add your real images
Replace these files inside /assets:
- hero.jpg
- service-branding.jpg
- service-marketing.jpg
- service-digital.jpg
- project-1.jpg
- project-2.jpg
- gallery-1.jpg
- gallery-2.jpg
- gallery-3.jpg
- gallery-4.jpg

Recommended image size:
- Hero: 1600×1200 or similar
- Service cards: 1200×800
- Portfolio: 1400×1000
- Gallery: 1000×1000

## Feedback system
The current version is a working browser demo:
- A client can submit feedback.
- It is stored in localStorage.
- It appears immediately on the feedback page.
- It appears on the homepage too.

IMPORTANT:
localStorage is only visible on that browser/device. It is NOT a real shared database.

For a public site, use:
- Supabase / Firebase / PostgreSQL for reviews
- moderation / approval status before publishing
- spam protection such as Cloudflare Turnstile or reCAPTCHA
- server-side form validation

Recommended production review flow:
1. Client submits feedback.
2. Database stores it as `pending`.
3. You review it in an admin page.
4. You approve it.
5. Only approved reviews appear publicly.

This is safer and more trustworthy than publishing anything immediately.

## Contact form
Current demo opens the visitor's email app.
For production connect it to:
- Formspree
- Resend
- EmailJS
- your own API/backend

## Run locally
Open index.html or use VS Code Live Server.

## Hosting
This static version works on Hostinger, Netlify, Vercel, GitHub Pages, and similar hosts.
