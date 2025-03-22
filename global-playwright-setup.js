import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


export default async () => {
  console.log('Loaded environment variables for Playwright tests');
};