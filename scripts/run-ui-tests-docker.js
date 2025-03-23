import { spawn, execSync } from 'child_process';
import { startMongoMemoryServer, stopMongoMemoryServer } from '../utils/mongo-memory-server-docker.js';
import fs from 'fs/promises';
import waitOn from 'wait-on';

let devProcess;
let mongoRunning = false;

const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const PORT = 6060;

async function cleanup(exitCode = 0) {
  console.log('🧹 Cleaning up...');

  if (devProcess) {
    console.log(`✋ Stopping dev process (PID: ${devProcess.pid})...`);
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${devProcess.pid} /T /F`);
      } else {
        process.kill(-devProcess.pid, 'SIGTERM');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('⚠️ Error stopping dev process:', err.message);
    } finally {
      devProcess = null;
    }
  }

  if (mongoRunning) {
    console.log('✋ Stopping MongoDB...');
    await stopMongoMemoryServer();
    mongoRunning = false;
    console.log('✅ MongoDB stopped');
  }

  console.log('✋ Removing .mongo-uri file...');
  await fs.unlink('.mongo-uri').catch(() => {});
  console.log('✅ Cleanup complete');

  process.exit(exitCode);
}

async function run() {
  try {
    const mongoUri = await startMongoMemoryServer();
    mongoRunning = true;
    await fs.writeFile('.mongo-uri', mongoUri, 'utf-8');

    devProcess = spawn('npm', ['run', 'dev:test'], {
      env: { ...process.env, MONGO_URL: mongoUri },
      detached: true,
      stdio: 'inherit',
      shell: true,
    });

    console.log('⌛ Waiting for app to be ready...');
    await waitOn({
      resources: ['http://localhost:3000'],
      timeout: 30000,
      interval: 500,
      validateStatus: status => status === 200,
    });
    console.log('✅ Client is ready');

    console.log('🚀 Running Playwright tests...');
    const testProcess = spawn('npx', ['playwright', 'test'], {
      stdio: 'inherit',
      shell: true,
    });

    testProcess.on('close', (code) => {
      cleanup(code).catch((err) => {
        console.error('Cleanup error:', err);
        process.exit(1);
      });
    });
  } catch (err) {
    console.error('❌ Error during test run:', err);
    await cleanup(1);
  }
}


const handleSignal = (signal) => {
  console.log(`\n${signal} received`);
  cleanup(1).catch(() => process.exit(1));
};

process.on('SIGINT', () => handleSignal('SIGINT'));
process.on('SIGTERM', () => handleSignal('SIGTERM'));


process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  cleanup(1).catch(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  cleanup(1).catch(() => process.exit(1));
});

run();
