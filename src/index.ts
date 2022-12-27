import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes';

// Apply module augmentation
import './types/Response';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`⚡[server]: Server is running on port ${port}`);
});
