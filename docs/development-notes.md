# Development Notes

This document contains common commands and setup notes for working on the MediaVault project locally.

---

## Node Version

This project uses the Node version listed in `.nvmrc`.

Use the project Node version:

```bash
nvm use
```

Install a specific Node version:

```bash
nvm install 22.12.0
```

Set the default Node version:

```bash
nvm alias default 22.12.0
```

Check the current Node version:

```bash
node -v
```

---

## Backend Commands

Run the backend server:

```bash
cd backend
npm run dev
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install a backend package:

```bash
cd backend
npm install <package-name>
```

Install a backend development dependency:

```bash
cd backend
npm install -D <package-name>
```

---

## Frontend Commands

Run the frontend development server:

```bash
cd frontend
npm run dev
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install a frontend package:

```bash
cd frontend
npm install <package-name>
```

---

## Prisma Commands

Run Prisma commands from the `backend` directory.

Validate the Prisma schema:

```bash
cd backend
npx prisma validate
```

Run a migration after changing `schema.prisma`:

```bash
cd backend
npx prisma migrate dev --name <migration-name>
```

Example:

```bash
cd backend
npx prisma migrate dev --name add-media-file-path
```

Open Prisma Studio:

```bash
cd backend
npx prisma studio
```

Regenerate Prisma Client:

```bash
cd backend
npx prisma generate
```

Introspect the current database:

```bash
cd backend
npx prisma db pull
```

---

## PostgreSQL Commands

Open the PostgreSQL shell:

```bash
psql postgres
```

Quit the PostgreSQL shell:

```sql
\q
```

List PostgreSQL roles/users:

```sql
\du
```

List databases:

```sql
\l
```

Connect to the MediaVault database:

```sql
\c mediavault
```

Create the MediaVault database:

```sql
CREATE DATABASE mediavault;
```

Create the MediaVault database user:

```sql
CREATE USER mediavault_user WITH PASSWORD 'your_password_here';
```

Allow the user to create databases for Prisma shadow databases:

```sql
ALTER USER mediavault_user CREATEDB;
```

Grant database privileges:

```sql
GRANT ALL PRIVILEGES ON DATABASE mediavault TO mediavault_user;
```

Grant schema privileges:

```sql
\c mediavault
GRANT USAGE, CREATE ON SCHEMA public TO mediavault_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mediavault_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mediavault_user;
```

If needed for local development, make `mediavault_user` the owner of the `public` schema:

```sql
\c mediavault
ALTER SCHEMA public OWNER TO mediavault_user;
```

Test the database connection:

```bash
psql "postgresql://mediavault_user:your_password_here@localhost:5432/mediavault"
```

---

## Environment Variables

Backend `.env` example:

```env
DATABASE_URL="postgresql://mediavault_user:your_password_here@localhost:5432/mediavault"
JWT_SECRET="your_long_random_secret_here"
PORT=5001
```

Frontend `.env` example:

```env
VITE_API_BASE_URL=http://localhost:5001
```

Never commit real `.env` files to GitHub.

---

## Local File Uploads

Uploaded files are stored locally in:

```text
backend/uploads/
```

These files should not be committed to GitHub.

Make sure `.gitignore` includes:

```gitignore
uploads/
backend/uploads/
```

The backend serves uploaded files locally with:

```js
app.use("/uploads", express.static("uploads"));
```

Example local file URL:

```text
http://localhost:5001/uploads/<filename>
```

In production, uploaded files should eventually be stored in S3 instead of the local `uploads/` folder.

---

## Postman Testing Notes

Base URL:

```text
http://localhost:5001
```

For protected routes, use:

```text
Authorization: Bearer <token>
```

In Postman:

- Go to the Authorization tab
- Select `Bearer Token`
- Paste the token without quotes

For JSON requests:

- Body -> raw -> JSON

For file uploads:

- Body -> form-data
- `albumId` should be type `Text`
- `media` should be type `File`
- Use the same `media` key multiple times for multiple uploads
