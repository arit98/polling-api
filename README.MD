# Polling API

A real-time polling application built with Express, Prisma, PostgreSQL, and Socket.IO. Provides secure user authentication and RESTful API endpoints for creating/managing polls and voting.

## Features

- User authentication (JWT)
- CRUD operations for polls
- Real-time vote updates via WebSockets
- Role-based access control (user/admin)
- PostgreSQL database with Prisma ORM

## Technologies

- Node.js
- Express
- Prisma
- PostgreSQL
- Socket.IO
- JWT (Authentication)
- Bcrypt (Password hashing)

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- NPM

### Installation
```bash
npm install
```

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/polls_db?schema=public"
JWT_SECRET=your_jwt_secret
PORT=3000
```

run this command on **psql** shell `
    CREATE DATABASE polls_db;
`

run this command to generate `
npx prisma generate
`

run this command to migrate the dbs `
npx prisma migrate dev --name add_role_to_user
`
endpoints:
#### Users
- POST /api/user/register - Register new user
- POST /api/user/login - User login
- PUT /api/user/:id - User update
- DELETE /api/user/:id - User delete (admin only)
- GET /api/user/:id - List users
- GET /api/user/all - List all users (admin only)

#### Polls
- POST /api/polls/create - Create new poll (admin only)
- GET /api/polls/:id - List polls
- POST /api/polls/:pollId/vote - Submit vote