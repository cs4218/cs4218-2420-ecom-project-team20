import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

let containerId;
const MONGODB_PORT = 27017;

export async function startMongoMemoryServer() {
  try {
    const containerName = `mongodb-test-${randomUUID()}`;
    
    console.log('Pulling MongoDB Docker image...');
    execSync('docker pull mongo:latest');
    
    console.log('Starting MongoDB Docker container...');
    containerId = execSync(
      `docker run --rm -d \
      -p ${MONGODB_PORT}:27017 \
      --name ${containerName} \
      mongo:latest \
      `,
      { encoding: 'utf8' }
    ).trim();

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isReady && attempts < maxAttempts) {
      try {
        console.log('Waiting for MongoDB to be ready...');
        execSync(`docker exec ${containerId} mongosh --eval "db.serverStatus()"`);
        isReady = true;
      } catch (error) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!isReady) {
      throw new Error('MongoDB container failed to start properly');
    }
    
    console.log(`MongoDB Docker container started with ID: ${containerId}`);
    return `mongodb://localhost:${MONGODB_PORT}/testdb`;
  } catch (error) {
    console.error('Error starting MongoDB Docker container:', error);
    if (containerId) {
      await stopMongoDB();
    }
    throw error;
  }
}


export async function stopMongoMemoryServer() {
  if (containerId) {
    try {
      console.log(`Stopping MongoDB Docker container: ${containerId}`);
      execSync(`docker stop ${containerId}`);
      containerId = null;
    } catch (error) {
      console.error('Error stopping MongoDB Docker container:', error);
      throw error;
    }
  }
}