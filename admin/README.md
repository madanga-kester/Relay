# Relay Admin Portal

This folder is an intentionally isolated, frontend-only admin portal. It does not modify or import the main marketplace routes, authentication flow, data layer, or UI files.

## Open locally

From the project root:

```bash
python3 -m http.server 4174
```

Open `http://localhost:4174/admin/`.

## Demo admin access

- Email: `admin@relay.local`
- Password: `admin123`

The login uses `sessionStorage` and is only a frontend prototype. It is separate from the main marketplace authentication journey and is not a production security boundary.

## Admin pages

- `index.html` — independent admin login
- `dashboard.html` — operations overview
- `campaigns.html` — campaign registry
- `users.html` — user management
- `applications.html` — application queue
- `placements.html` — placement delivery
- `activity.html` — admin activity history
- `settings.html` — admin profile and access boundary
