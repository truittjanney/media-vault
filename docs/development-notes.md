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
npx prisma migrate dev --name <describe-changes-here>
```

Check whether the database is up to date with migrations:

```bash
cd backend
npx prisma migrate status
```

Regenerate Prisma Client if needed:

```bash
cd backend
npx prisma generate
```

Open Prisma Studio to visually inspect local database records:

```bash
cd backend
npx prisma studio
```

Examine the current database, if needed. Use carefully because this updates `schema.prisma` based on the current database:

```bash
cd backend
npx prisma db pull
```

Recommended Prisma command order:

```txt
validate → migrate → status → generate → studio
```

Restart the backend after schema or Prisma Client changes if needed.

---

### Prisma Troubleshooting

If the backend logs errors like:

- column does not exist
- table does not exist
- unknown field

then Prisma, the generated Prisma Client, and the database may be out of sync.

Recommended Prisma sync/check flow:

```bash
cd backend
npx prisma migrate status
npx prisma validate
npx prisma generate
```

If `schema.prisma` changed and no migration exists yet:

```bash
cd backend
npx prisma migrate dev --name <describe-changes-here>
```

Restart the backend after schema or Prisma Client changes if needed.

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

# App URLs
FRONTEND_URL=http://localhost:5173

# AWS / S3 Configuration
AWS_REGION=us-east-2
S3_BUCKET_NAME=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# Email Configuration
SES_FROM_EMAIL=
```

Frontend `.env` example:

```env
VITE_API_BASE_URL=http://localhost:5001
```

Never commit real `.env` files to GitHub.

---

## Amazon S3 Media Storage

MediaVault stores uploaded photos and videos in a private Amazon S3 bucket.

The backend uses `multer.memoryStorage()` so uploaded files are temporarily held in memory before being sent to S3. Files are not stored in a local `uploads/` directory.

The database stores the S3 object key in `Media.filePath`.

Example S3 object key:

```text
users/6/albums/12/random-file-name.png
```

```txt
Upload Flow:
React frontend → Express backend → Multer memory storage → Amazon S3 → Prisma stores S3 object key in Media.filePath

View Flow:
React frontend → Express backend → Prisma reads Media.filePath → backend generates temporary signed S3 URL → frontend renders image/video using media.url

Delete Flow:
React frontend → Express backend → delete S3 object → delete Prisma media record
```

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
