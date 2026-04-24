import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat';
import { emailRouter } from './routes/email';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/chat', chatRouter);
app.use('/api/send-email', emailRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
