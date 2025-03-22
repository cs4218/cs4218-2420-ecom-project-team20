
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function startMongoMemoryServer() {
  mongoServer = new MongoMemoryServer({
    binary: {
      version: '4.4.6',
    },
  });
  await mongoServer.start();
  return mongoServer.getUri();
}

export async function stopMongoMemoryServer() {
  if (mongoServer) {
    await mongoServer.stop();
  }
}
