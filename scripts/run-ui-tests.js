import { spawn } from 'child_process';
import { startMongoMemoryServer, stopMongoMemoryServer } from '../utils/mongo-memory-server.js';
import fs from 'fs/promises';

let devProcess;

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function run() {
  try {
    const mongoUri = await startMongoMemoryServer();
    await fs.writeFile('.mongo-uri', mongoUri, 'utf-8');

    devProcess = spawn('npm', ['run', 'dev:test'], {
      env: { ...process.env, MONGO_URL: mongoUri },
      stdio: 'inherit',
      shell: true,
    });

    console.log('⌛ Waiting for app to be ready...');
    await wait(5000);

    console.log('🚀 Running Playwright tests...');
    const testProcess = spawn('npx', ['playwright', 'test'], {
      stdio: 'inherit',
      shell: true,
    });

    testProcess.on('close', async (code) => {
      console.log(`🧹 Cleaning up...`);
      await stopMongoMemoryServer();
      await fs.unlink('.mongo-uri').catch(() => {});
      if (devProcess) devProcess.kill();

      process.exit(code);
    });
  } catch (err) {
    console.error('❌ Error during test run:', err);
    if (devProcess) devProcess.kill();
    await stopMongoMemoryServer();
    process.exit(1);
  }
}

run();
