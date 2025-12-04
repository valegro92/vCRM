# vCRM - Sevalla Deployment Best Practices

> **For AI Assistant**: Read this file at the start of every session to understand the deployment context and avoid common pitfalls.

## 1. Project Architecture Context
- **Frontend**: React (Create React App), located in `/src`. Builds to `/server/public`.
- **Backend**: Node.js + Express, located in `/server`.
- **Database**:
    - **Local**: SQLite (`server/database/crm.db`).
    - **Production (Sevalla)**: PostgreSQL (Connection via `DATABASE_URL`).
- **Deployment Method**: Docker (Nixpacks) via GitHub Webhook.

## 2. Pre-Deployment Checklist (CRITICAL)
Before pushing to `main`, ALWAYS perform these checks to prevent build failures on Sevalla:

### A. Local Build Verification
Run the build command locally to catch syntax errors (e.g., accidental markdown fences or missing brackets) that would break the production build.
```bash
# In the root directory
npm run build
```
*If this fails locally, it WILL fail on Sevalla.*

### B. Clean Up Debug Code
- Remove `console.log` used for debugging large objects.
- Ensure no temporary files (like `debug_invoices.js`) are imported in production code.
- Check `src/components/Dashboard.js` and `server/routes/` for any "test" code.

### C. Database Compatibility Check
- **SQL Differences**: Remember that SQLite and Postgres have different syntax for dates and types.
    - **Dates**: SQLite uses strings (`YYYY-MM-DD`), Postgres uses native `Date` types.
    - **Casting**: Use `::int` or `::text` in Postgres, but not in SQLite.
- **Stats Calculation**: Prefer calculating complex stats (sums, aggregations) in **JavaScript** (server-side) rather than complex SQL queries, to ensure consistency across both DBs.

## 3. Deployment Process
1.  **Commit Changes**:
    ```bash
    git add .
    git commit -m "feat: description of changes"
    ```
2.  **Push to Main**:
    ```bash
    git push origin main
    ```
3.  **Monitor Sevalla**:
    - Watch the "Build Logs" immediately.
    - If build fails, check the log for "Build failed" errors (usually syntax or missing dependencies).

## 4. Troubleshooting Common Issues

### Issue: "White Screen" or 404 on Dashboard
- **Cause**: React Router not handling client-side routing correctly in production.
- **Fix**: Ensure `server/index.js` has the catch-all route:
    ```javascript
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    ```

### Issue: Data Missing (e.g., "Fatturato 0")
- **Cause**: Mismatch between `issueDate` (DB field) and `date` (Frontend expectation), or SQL type casting issues.
- **Fix**: Inspect the raw API response in Browser Console. Use JS-based aggregation in the backend.

### Issue: Build Error "Unexpected token"
- **Cause**: Markdown artifacts or copy-paste errors in source files.
- **Fix**: Run `npm run build` locally to identify the exact file and line.

## 5. Environment Variables (Sevalla)
Ensure these are set in Sevalla Project Settings:
- `NODE_ENV`: `production`
- `DATABASE_URL`: (Postgres Connection String)
- `JWT_SECRET`: (Secure random string)
- `PORT`: `8080` (Standard for Sevalla/Nixpacks)
