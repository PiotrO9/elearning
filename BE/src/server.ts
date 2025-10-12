import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Testowy endpoint
app.get('/', (req: Request, res: Response) => {
	console.log(req);
  res.json({
    message: 'Hello World! Serwer Express + TypeScript działa!',
    timestamp: new Date().toISOString()
  });
});

// Start serwera
app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
  console.log(`📡 http://localhost:${PORT}`);
});

