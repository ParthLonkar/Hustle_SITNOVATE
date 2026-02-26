import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/authRoutes.js';
import farmerRoutes from '../routes/farmerRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Agrichain API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
