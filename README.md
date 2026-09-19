# Personalized Video Outreach CRM

### A product prototype for turning targeted outreach into a trackable video workflow

This project explores a simple question: **what would outbound prospecting look like if personalized video, lightweight CRM workflow and engagement analytics lived in one product?**

I designed and built the prototype as a functional system rather than a static dashboard concept.

**Focus:** product UX · workflow design · video · CRM · analytics · Next.js / Supabase

[View my portfolio](https://www.archerdesign.shop/devon)

---

## Product flow

The prototype supports an end-to-end outreach workflow:

1. Import / seed prospect data
2. Search companies and contacts
3. Select a recipient
4. Upload a personalized video
5. Generate a public share experience
6. Copy an outreach link or open a prefilled email
7. Mark outreach as sent
8. Track viewing and CTA activity
9. Review engagement in the CRM

The public share page requires no recipient account and records meaningful interaction events back to the product.

## What users can do

### Accounts
- browse companies and contacts
- search by company, person, title or email
- open contact details
- jump to email, LinkedIn or company websites

### Personalized video
- choose a prospect
- upload MP4 / MOV content
- generate a public share link
- create a preview
- mark a video as sent

### Engagement
- track page views
- track playback
- record 25 / 50 / 75 / 100% progress
- capture CTA clicks
- show engagement history on the video record

### Recipient handoff
The public experience can also capture a "forward to the right person" action, allowing the workflow to learn when an initial contact redirects the outreach internally.

## Why I built it

The interesting design problem was not the video player itself. It was connecting several moments that normally live in separate tools:

**prospect → personalized content → outreach → viewing behavior → follow-up**

That makes this a service-design and systems-design project as much as a UI project.

## Technical architecture

- Next.js / React / TypeScript
- Supabase Postgres
- Supabase Storage for persistent media
- authenticated CRM surfaces
- public tokenized share routes
- event-based engagement tracking
- Vercel-compatible deployment
- local/demo fallback mode

## Production considerations explored

The prototype includes work around:

- persistent vs local media storage
- public share links without authentication
- signed URLs for private video storage
- environment-based deployment behavior
- server-side admin / seed workflows
- event analytics
- invite-only access
- graceful handling of features that require writable server storage

## Local development

```bash
npm install
npm run dev
```

The project supports a local demo mode and a Supabase-backed environment for persistent data and media.

---

**Devon Archer**  
Creative Technologist / Product Designer  
[Portfolio](https://www.archerdesign.shop/devon) · [GitHub](https://github.com/devon-gif)
