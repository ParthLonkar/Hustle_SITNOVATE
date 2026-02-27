# AgriChain - Quick Start Guide

## Running the Application

### Backend (Port 5000)
```
bash
cd backend
npm install
npm start
```
Server will run on http://localhost:5000

### Frontend (Port 5173)
```
bash
cd frontend
npm install
npm run dev
```
Frontend will run on http://localhost:5173

## Demo Login Credentials
- **Farmer**: demo@agrichain.com / demo123
- **Admin**: admin@agrichain.com / admin123  
- **Trader**: trader@agrichain.com / trader123

## Features Working in Demo Mode
All features work without database:
- ✅ User authentication (login/register)
- ✅ Weather data (demo data)
- ✅ Mandi prices (demo data)
- ✅ Crop recommendations
- ✅ Spoilage simulation
- ✅ Statistics dashboard
- ✅ Preservation actions

## Connecting Real External APIs (Optional)

### Weather API
1. Sign up at https://www.weatherunlocked.com/
2. Get free API credentials
3. Add to backend/.env:
```
WEATHERUNLOCKED_APP_ID=your_app_id
WEATHERUNLOCKED_APP_KEY=your_app_key
```

### Mandi Price API
1. Sign up at https://data.gov.in/
2. Get free API key
3. Add to backend/.env:
```
DATA_GOV_API_KEY=your_api_key
```

## Database (Optional)
For persistent data storage, set up PostgreSQL:
1. Install PostgreSQL
2. Create database 'agrichain'
3. Update backend/.env with DB credentials
4. Run migrations from database/schema.sql
