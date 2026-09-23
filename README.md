# Work Ticket Management System

## Setup
1. Install Node.js and MySQL.
2. Run `npm install` in this folder.
3. Import the schema: `mysql -u root -p < models/schema.sql`
4. Copy `.env.example` to `.env` and fill in your DB credentials.
5. Run `npm start` (or `npm run dev` with nodemon).
6. Open `http://localhost:3000/signup.html` to create an account.

## Folder structure
- server.js - app entry point
- config/db.js - MySQL connection pool
- middleware/auth.js - JWT auth and role check
- routes/auth.js - signup, login, logout
- routes/tickets.js - ticket CRUD, assign, status update
- routes/notifications.js - fetch and mark notifications read
- models/schema.sql - database schema
- public/ - frontend pages (login, signup, dashboard, create ticket)

## Notes
- First admin user must be created manually in the database (update a user's role to 'admin' via SQL), since signup only allows requestor or developer.
- Notifications are stored in the database but not yet displayed in the UI. Add a notifications page/dropdown if you want that visible for Prelim.
