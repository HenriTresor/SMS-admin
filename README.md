# Credit Jambo - Admin Application

## Overview
The Admin Application is a web dashboard built with React and TailwindCSS v4, allowing administrators to manage users, verify devices, and monitor transactions.

## Features
- Admin authentication
- View all users with balances and devices
- Verify user devices
- View transaction history
- Statistics dashboard

## Tech Stack
- React
- Vite
- TailwindCSS v4
- Axios for API calls

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Backend
The dashboard communicates with the backend at `http://localhost:3001`.

## Notes
- Ensure the backend is running before using the dashboard.
- Admin credentials need to be set up in the database.
