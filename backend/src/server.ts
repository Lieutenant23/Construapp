import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import expenseRoutes from './routes/expenses';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
// servir arquivos de upload
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/expenses', expenseRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});