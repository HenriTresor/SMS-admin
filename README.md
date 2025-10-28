# Credit Jambo Admin Application

Web-based management dashboard for administrators to oversee customer accounts, verify devices, and monitor transactions.

## Features

- 🔐 **Admin Authentication**: Secure login for management access
- 👥 **User Management**: View and manage all customer accounts
- 📱 **Device Verification**: Approve/reject customer device registrations
- 📊 **Statistics Dashboard**: Real-time analytics and key metrics
- 💰 **Transaction Monitoring**: Track all savings transactions
- 🔍 **Advanced Filtering**: Search and filter users, devices, and transactions
- 📈 **Analytics**: View system statistics and trends

## Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT for admin sessions
- **UI Framework**: TailwindCSS with custom components

## Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Setup

1. **Backend API (Terminal 1)**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The API boots at `http://localhost:3001`.

2. **Frontend dashboard (Terminal 2)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Vite serves the UI at `http://localhost:5173`.

- Optional: run `npm run setup` inside `backend/` if you want Prisma migrations + seed data in one step.

## API Documentation

- **Swagger/OpenAPI**: Available at [`http://localhost:3001/docs`](http://localhost:3001/docs) when the backend is running. The raw JSON lives at `/docs.json`.
- **Postman / Requestly Collection**: Export the live endpoints into a collection (suggested path `docs/postman/admin-api.postman_collection.json`) so the team can iterate quickly.
- Update both Swagger and the collection whenever you add or modify routes.

### Quick Postman Checklist
1. Set a `{{baseUrl}}` variable to `http://localhost:3001` (or your deployed URL).
2. Add a `POST /admin/login` request to fetch a JWT.
3. Use Postman pre-request scripts to inject the JWT into the `Authorization` header for subsequent calls.
4. Export and commit the collection once updated.

## Dockerised Setup

Use the lightweight compose file for local experiments:

```bash
# From admin-app/
docker-compose up --build -d

# Tear down when finished
docker-compose down
```

This spins up PostgreSQL and the admin backend container. Connect the frontend locally (Vite dev server) or build a production image as needed.

## API Endpoints

### Admin Authentication
- `POST /admin/login` - Admin login

### User Management
- `GET /admin/users` - List all users
- `GET /admin/devices` - List all devices
- `PUT /admin/devices/:id/verify` - Verify user device
- `GET /admin/transactions` - List all transactions

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/credit_jambo"
JWT_SECRET="your-super-secure-admin-jwt-secret-here"
PORT=3001
```

## Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# View database in Prisma Studio
npm run db:studio
```

### Seed Admin User

The setup process automatically creates a default admin user:

```bash
# Run setup (includes seeding)
npm run setup
```

**Default Admin Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the default password after first login!

To manually seed or re-seed the admin user:

```bash
# From backend directory
cd backend
npm run seed
```

## Testing

- Tests run with **Jest** + **Supertest**. Coverage includes the `/admin/login` auth flow plus all management endpoints (`/admin/users`, `/admin/devices`, `/admin/devices/:id/verify`, `/admin/transactions`) using mocked services.
- Execute commands from `admin-app/backend/`:
```bash
npm test
npm run test:coverage
```

- When adding new suites that depend on JWTs, ensure `process.env.JWT_SECRET` is set (the tests inject their own secret during execution).

## Production Deployment

### Docker Compose (backend + database)
```bash
# Build and run in detached mode
docker-compose up --build -d

# Follow logs
docker-compose logs -f backend

# Stop and remove containers
docker-compose down
```

Set environment overrides in an `.env` file alongside `docker-compose.yml`:

```env
ADMIN_DB_NAME=credit_jambo
ADMIN_DB_USER=postgres
ADMIN_DB_PASSWORD=postgres
ADMIN_DB_PORT=5433
ADMIN_DATABASE_URL=postgresql://postgres:postgres@db:5432/credit_jambo
ADMIN_JWT_SECRET=changeme
ADMIN_BACKEND_PORT=3001
```

Any value omitted falls back to the defaults baked into the compose file.

### Manual (backend only)
```bash
# Transpile TypeScript
npm run build

# Launch compiled server
npm start
```

## Admin Dashboard Usage

### Login
- Access the dashboard at `http://localhost:5173` (dev) or `http://localhost:8080` (prod)
- Login with admin credentials

### Overview Tab
- **Key Statistics**: Total users, verified devices, recent transactions, total balance
- **Recent Activity**: Latest transactions with user details

### Users Tab
- View all registered users
- See account balances and device counts
- User registration dates and activity

### Devices Tab
- **Device Verification**: Approve/reject pending device registrations
- **Device Management**: View all devices with verification status
- **Search & Filter**: Find devices by user email or device ID
- **Status Filtering**: Show only verified, unverified, or all devices

### Transactions Tab
- **Transaction History**: Complete log of all deposits and withdrawals
- **Search & Filter**: Filter by user email or transaction type
- **Real-time Updates**: Live transaction monitoring

## Security Features

- SHA-512 password hashing for admin accounts
- JWT authentication with configurable expiration
- Role-based access control
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure HTTP headers (Helmet)
- CORS configuration

## Development Scripts

Run these inside the relevant package directory.

### Backend (`admin-app/backend`)
- `npm run dev` &mdash; start the Express server with tsx watcher
- `npm run build` &mdash; compile TypeScript to `dist/`
- `npm start` &mdash; run the compiled server
- `npm test` / `npm run test:coverage` &mdash; execute Jest suites
- `npm run db:generate | db:push | db:studio` &mdash; Prisma workflows
- `npm run clean` &mdash; reinstall dependencies from scratch

### Frontend (`admin-app/frontend`)
- `npm run dev` &mdash; start the Vite dev server
- `npm run build` &mdash; create a production bundle
- `npm run preview` &mdash; serve the production build locally
- `npm run lint` / `npm run lint:fix` &mdash; apply ESLint rules

## Project Structure

```
admin-app/
├── frontend/              # React + TypeScript dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── utils/         # API and utility functions
│   │   ├── constants/     # App constants
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── nginx.conf         # Production nginx config
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middlewares/   # Custom middleware
│   │   ├── routes/        # API routes
│   │   ├── schemas/       # Validation schemas
│   │   └── server.ts      # Server entry point
│   └── prisma/            # Database schema and migrations
├── docker-compose.yml     # Docker orchestration
├── package.json           # Project scripts and dependencies
└── README.md             # This file
```

## UI Components

### Layout Components
- **Card**: Content containers with headers
- **Button**: Action buttons with variants (primary, secondary, danger)
- **Input**: Form inputs with validation states

### Dashboard Features
- **Tabbed Navigation**: Switch between Overview, Users, Devices, Transactions
- **Statistics Cards**: Key metrics with icons and colors
- **Data Tables**: Sortable, filterable lists with search
- **Status Badges**: Visual indicators for verification states
- **Action Buttons**: Device verification and other admin actions

## API Integration

The admin dashboard communicates with the backend API for:
- Authentication and session management
- Real-time data fetching and updates
- Device verification actions
- Statistics and analytics data

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lazy loading for large datasets
- Optimized bundle size with code splitting
- Efficient re-rendering with React hooks
- Database query optimization with Prisma

## Contributing

1. Follow TypeScript and ESLint rules
2. Write comprehensive tests for new features
3. Use conventional commit messages
4. Test UI changes across different screen sizes
5. Update API documentation for backend changes

## Coding Style

- TypeScript everywhere &mdash; keep types strict and avoid `any`.
- ESLint is configured (`npm run lint`). Run it before opening a PR; add `npm run lint:fix` to resolve obvious issues.
- Follow the existing folder boundaries (controllers ↔ services ↔ routes) to keep logic focused.

## Assumptions & Notes

- Node.js v18 or newer and PostgreSQL are available locally.
- Environment variables are managed via `admin-app/backend/.env` and **are not committed**.
- Default admin credentials (`admin` / `admin123`) are for development only; rotate them immediately in any shared environment.

## License

This project is for educational purposes.
