# PrintMatch — Frontend

React + TypeScript frontend for PrintMatch, Thailand's 3D printing commission marketplace.

Live: **https://app.idkidcidgaf.live**

---

## What it does

PrintMatch connects people who need 3D printed parts (commissioners) with local 3D printing partners. This frontend handles:

- User registration and login (role-based: commissioner or partner)
- Browsing and requesting printing partners
- Job tracking dashboard
- Real-time messaging per job
- Partner profile management
- Admin dashboard (approvals, appeals, reports)
- Settings (change password, account info)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 + TypeScript | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| React Router v6 | Client-side routing |
| Axios | API requests |
| Context API | Auth state management |

---

## Project Structure

```
src/
├── api/
│   └── client.ts              # Axios instance, auth headers, 401 redirect
├── components/
│   ├── Layout.tsx             # User sidebar (dark green, role switcher)
│   ├── AdminLayout.tsx        # Admin sidebar (white, user dropdown)
│   └── BecomePartnerModal.tsx # Partner onboarding modal
├── context/
│   ├── AuthContext.tsx        # Login, register, logout, user state
│   └── ToastContext.tsx       # Global toast notifications
├── pages/
│   ├── Login.tsx              # Split-panel login
│   ├── Register.tsx           # Split-panel register (name/email/phone/province/password)
│   ├── Dashboard.tsx          # My Commissions (commissioner view)
│   ├── BrowsePartners.tsx     # Find a partner
│   ├── PartnerView.tsx        # Individual partner profile + request job
│   ├── JobDetail.tsx          # Job status, quotes, progress, messages
│   ├── PartnerRequests.tsx    # Incoming requests (partner view)
│   ├── ConversationsInbox.tsx # All conversations
│   ├── ConversationThread.tsx # Single conversation
│   ├── ProfilePage.tsx        # Edit name, address, partner profile
│   ├── SettingsPage.tsx       # Change password (users only)
│   ├── BecomePrinter.tsx      # Partner application form
│   ├── AppealPage.tsx         # Submit appeal
│   ├── AdminOverview.tsx      # Admin stats dashboard
│   ├── AdminJobs.tsx          # All jobs (admin)
│   ├── AdminReview.tsx        # Partner application approvals
│   ├── AdminAppeals.tsx       # Appeals management
│   └── AdminReports.tsx       # Failure reports
└── App.tsx                    # Routes (PrivateRoute, AdminRoute, PublicRoute)
```

---

## Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:3000

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

```env
VITE_API_URL=https://api.idkidcidgaf.live
```

In development, set to `http://localhost:3000`.

---

## Build & Deploy

```bash
# Build for production
npm run build

# Sync to S3 (correct bucket)
aws s3 sync dist/ s3://printmatch-frontend-513509566348/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1O6VR3IU0GLQU --paths "/*"
```

> Note: There are two S3 buckets. Frontend deploys go to `printmatch-frontend-513509566348` only.

---

## Cloud Infrastructure

```
User
 └── CloudFront (E1O6VR3IU0GLQU)
      ├── Origin: S3 bucket (printmatch-frontend-513509566348)
      ├── HTTPS enforced via ACM certificate
      ├── Custom error: 404 → /index.html (200) for React Router SPA routing
      └── Domain: app.idkidcidgaf.live
```

---

## Authentication Flow

1. User logs in → backend returns JWT token
2. Token stored in `localStorage`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. On 401 response → token removed, redirect to `/login`
5. On app load → `GET /api/auth/me` to restore session

---

## Route Protection

| Route type | Component | Behaviour |
|-----------|-----------|-----------|
| Public | `PublicRoute` | Redirects to `/` if already logged in |
| Private | `PrivateRoute` | Redirects to `/login` if not logged in |
| Admin | `AdminRoute` | Redirects to `/` if not admin |

---

## Design System

| Token | Value |
|-------|-------|
| Primary green | `#1DBF73` |
| Hover green | `#19a463` |
| Sidebar background | `linear-gradient(180deg, #0f1a14, #162210)` |
| Heading font | Outfit |
| Body font | Nunito Sans |
| Form inputs | No border radius (`borderRadius: 0`) |
