# Agrichain

Hackathon-ready full stack project with auth, mandi prices, weather data, and AI recommendations.

## Backend Setup

1. Install dependencies
```
cd backend
npm install
```

2. Configure environment
Copy `backend/.env.example` to `backend/.env` and fill values.

3. Initialize database
```
psql -U postgres -d agrichain -f database/schema.sql
```

4. Run server
```
cd backend
npm start
```

Server runs on `http://localhost:5000`.

## API Endpoints

Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

Crops
- `GET /api/crops`
- `POST /api/crops` (admin)
- `PUT /api/crops/:id` (admin)
- `DELETE /api/crops/:id` (admin)

Mandi Prices
- `GET /api/mandi-prices?crop_id=&mandi_name=&date_from=&date_to=`
- `POST /api/mandi-prices` (admin, trader)

Weather
- `GET /api/weather?region=&date_from=&date_to=`
- `POST /api/weather` (admin)

Recommendations
- `POST /api/recommendations/generate` (auth)
- `GET /api/recommendations/me` (auth)
- `GET /api/recommendations/all` (admin)

## Sample Requests

Register
```
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"farmer","region":"Pune"}'
```

Login
```
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Generate Recommendation
```
curl -X POST http://localhost:5000/api/recommendations/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"crop_id":1,"region":"Pune","quantity":100}'
```

## ML Service (Optional)
If `ML_SERVICE_URL` is set, the backend will call `/recommend` on that service.
If not available, the backend uses a rule-based fallback.
