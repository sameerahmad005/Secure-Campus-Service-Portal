import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const port = process.env.PORT || 5000;
const app = createApp();

app.listen(port, () => {
  console.log(`[Backend API] Secure Campus Service Portal API server listening on http://localhost:${port}`);
  console.log(`[Backend API] Health check ready at http://localhost:${port}/api/v1/health`);
});
