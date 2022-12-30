import dotenv from 'dotenv';

import createApp from './app/createApp';

dotenv.config();

const port = Number(process.env.PORT) || 8000;
const app = createApp(port);
