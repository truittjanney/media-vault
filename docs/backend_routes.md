## Authentication/User Routes

- POST /api/users/signup - User Signup
- POST /api/users/login - User Login
- POST /api/users/forgot-password - Forgot Password
- POST /api/users/reset-password - Reset Password
- GET /api/users/profile - Get User Profile
- PUT /api/users/profile - Update User Profile
- DELETE /api/users/profile - Delete User Account

## Album Routes

- POST /api/albums - Create Album
- POST /api/albums/:id/verify-pin - Verify PIN
- GET /api/albums - List User's Current Albums
- GET /api/albums/:id/media - List Media in Album
- PUT /api/albums/:id - Update Album
- PATCH /api/albums/:id/lock - Add Album Lock
- PATCH /api/albums/:id/remove-lock - Remove Album Lock
- DELETE /api/albums/:id - Delete Album

## Media Routes

- POST /api/media - Upload Media to Album
- PATCH /api/media/move - Move Multiple Media to Another Album
- PATCH /api/media/:id/move - Move Media to Another Album
- PATCH /api/media/:id/favorite - Toggle Media Favorites
- DELETE /api/media - Delete Multiple Media Items
- DELETE /api/media/:id - Delete One Media Item
