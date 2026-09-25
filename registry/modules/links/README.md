# links

A link-in-bio page you own, at `/links`.

- **Standalone and thumb-friendly**: avatar, name, bio, big tap targets, your socials. No site
  header or footer, so it loads fast from Instagram or TikTok in-app browsers.
- **UTM tagging**: outbound links get `utm_source=<your domain>&utm_medium=links`, so the sites
  you link to (and your own analytics) can see where visitors came from.
- **Share in person**: a **QR code** button shows a scannable code on your phone screen, and
  `/links/qr.svg` is a print-ready vector for slides, badges and business cards.
- **Save contact**: `/links/vcard` gives phones a contact card with your name, email, website
  and social profiles.

## Setup

Edit `site.config.ts`:

```ts
links: {
  bio: "Designer and developer.",
  avatar: "/images/avatar.jpg",
  utm: true,
  items: [
    { label: "New: Field Notes", href: "https://…", description: "Out now", highlight: true },
    { label: "Newsletter", href: "/newsletter" },
  ],
},
```

Name, email and website come from `site.config.ts → author`; social links from `socials`.

## Environment

No variables.

## Usage

Put `https://<your-domain>/links` in your social bios.

## Customization

- Layout: `src/app/(links)/links/page.tsx`.
- The QR code draws in `currentColor`; restyle it by setting `color` on its container.

## Removal

`pnpm site remove links`.
