# MediaVault

A full-stack media storage and vault web application for securely organizing photos and videos.

## Tech Stack

- React.js, JavaScript, Bootstrap, CSS3, HTML5, Fetch API (Frontend)
- Node.js, Express.js, Multer (Backend)
- PostgreSQL, Prisma ORM (Database)
- Jest (Testing)
- AWS (Planned for cloud infrastructure)
- Docker, Terraform, CI/CD (Planned)

## Features (Phase 1: MVP)

- User authentication
- Password to login to account
- PIN to enter locked albums
- Create album
- Rename album
- Delete album
- Import photos/videos + click-and-drag
- Move photos/videos to another album
- Favorite photos/videos <3
- File info on photos/videos
- Set album covers
- Delete photos/videos
- Delete multiple photos/videos via checkboxes
- Add lock to albums / remove lock from albums
- Organize albums: name, date created, date modified

## Planned Features (Upgrades)

- Change password for account login
- Change PIN for locked albums
- Organize photos/videos: click-and-drag
- “Recently Deleted” album, recover photos/videos, delete photos/videos
- Download/export photos/videos
- Rename photos/videos
- Change profile username

## Planned Features (Polish)

- Add tags to photos/videos
- Change album page layout
- Change photos/videos page layout
- Organize albums: custom
- Create sub-album

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
npx prisma migrate dev --name <migration-name>
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
