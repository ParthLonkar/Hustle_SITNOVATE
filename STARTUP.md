# Agrichain Setup Guide

## Quick Start (Using Docker)

The easiest way to run the full application is using Docker:

```
bash
# Navigate to project root
cd D:\Agrichain

# Start all services (database, backend, frontend, ML)
docker-compose -f docker/docker-compose.yml up -d
```

This will start:
- PostgreSQL on port 5432
- Backend API on port 5000
- Frontend on port 5173

---

## Manual Setup (Without Docker)

### Prerequisites
1. **Node.js** (v18+)
2. **PostgreSQL** (v15+)

### Step 1: Set up the Database

**Option A: Using Docker only for database**
```
bash
docker run -d `
  --name agrichain-db `
  -e POSTGRES_DB=agrichain `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  postgres:15
```

**Option B: Local PostgreSQL installation**
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a database named `agrichain`
3. Run the schema and seed files:
   
```
bash
   psql -U postgres -d agrichain -f database/schema.sql
   psql -U postgres -d agrichain -f database/seed_data.sql
   
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```
env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agrichain
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Optional: API Keys (leave empty for demo mode)
DATA_GOV_API_KEY=
WEATHERUNLOCKED_APP_ID=
WEATHERUNLOCKED_APP_KEY=
```

### Step 3: Start the Backend

```
bash
cd backend
npm install
npm start
```

The backend will run on http://localhost:5001

### Step 4: Start the Frontend

Open a new terminal:

```
bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173

---

## Troubleshooting

### "ERR_CONNECTION_REFUSED" on port 5001
- Make sure the backend is running: `npm start` in the backend folder
- Check if PostgreSQL is running and accessible

### "Failed to fetch" errors
- This usually means the backend isn't responding
- Check the backend terminal for error messages
- Verify your `.env` file has correct database credentials

### Database connection errors
- Make sure PostgreSQL is running
- Verify DB credentials in backend/.env match your setup
- Try: `psql -U postgres -c "SELECT 1"` to test connection

---

## Demo Credentials

After starting the application, you can register new users or use these test accounts:

- **Farmer**: farmer@demo.com / password123
- **Admin**: admin@demo.com / password123
