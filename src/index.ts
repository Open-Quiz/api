import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 8000;

app.get('/', (req: Request, res: Response) => {
	res.send('Server :)');
});

app.listen(port, () => {
	console.log(`⚡[server]: Server is running on port ${port}`);
});
