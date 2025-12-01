# My Xampus - Next.js Conversion

This workspace contains a Next.js app converted from `Form.html`, with a simple MongoDB backend API route to store survey responses.

Quick start:

1. Install dependencies:

```powershell
npm install
```

2. Start development server:

```powershell
npm run dev
```

3. Open http://localhost:3000 in your browser.

Notes:
- The MongoDB connection string is stored in `.env.local` as `MONGODB_URI`.
- API route `POST /api/submit` saves documents into the `responses` collection in your database.

If you want me to commit these changes or adjust the layout, tell me which branch name to use.