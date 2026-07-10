# MediaVault

A full-stack media storage and vault web application for securely organizing photos and videos.

## Tech Stack

- React.js, JavaScript, CSS3, HTML5, Fetch API (Frontend)
- Node.js, Express.js, Multer (Backend)
- PostgreSQL, Prisma ORM (Database)
- AWS S3, AWS IAM, signed URLs (Cloud Storage)
- Docker, Terraform, CI/CD (Planned)

## Current Features

- User authentication
- Password to login to account
- Forgot password
- Create album
- PIN to enter locked albums
- Add lock to albums / remove lock from albums
- Rename album
- Delete album
- Organize albums: name, date created, date modified
- Import photos/videos + click-and-drag
- Move photos/videos to other albums
- Move multiple photos/videos to other albums via checkboxes
- Delete photos/videos
- Delete multiple photos/videos via checkboxes
- Set album covers
- Favorite photos/videos <3
- File info on photos/videos

## Planned Features (Upgrades)

- Change password for account login
- Change PIN for locked albums
- Change profile username
- Organize photos/videos via click-and-drag
- “Recently Deleted” album, recover photos/videos, delete photos/videos
- Download/export photos/videos
- Rename photos/videos

## Planned Features (Polish)

- Create sub-album
- Change album page layout
- Change photos/videos page layout
- Organize albums: custom
- Add tags to photos/videos

## Planned Features (A.I. / Advanced)

- Duplicate detection
- Photo/video categorization
- Auto-generate tags for photos/videos
- Smart search ("dog", "beach", etc.)
- Other A.I.-assisted organization features

## AWS Integration

Amazon S3 is set up for file cloud storage. Uploads now use multer.memoryStorage() and not diskStorage(). Files are uploaded to a private S3 bucket.

The database stores the S3 object key (a unique identifier for a file) in Media.filePath. The backend generates temporary signed URLs for frontend rendering. Deleting media items also deletes the S3 object.

## Common Commands

### Backend

Run the backend server:

```bash
cd backend
npm run dev
```

Run a Prisma migration after changing `schema.prisma`:

```bash
cd backend
npx prisma migrate dev --name <migration-name->
```

Validate the Prisma schema:

```bash
cd backend
npx prisma validate
```

### PostgreSQL

Open PostgreSQL shell:

```bash
psql postgres
```

Quit PostgreSQL shell:

```sql
\q
```

### Node Version

Use the project Node version from `.nvmrc`:

```bash
nvm use
```

Check the current Node version:

```bash
node -v
```

## Status

In development

## Author

Truitt Janney
