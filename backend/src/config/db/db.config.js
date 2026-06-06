// Mongoose connection manager.
// If MONGODB_URI is set -> connect to that (Atlas / local mongod).
// If it is blank -> spin up an ephemeral in-memory MongoDB so the API boots with zero setup.
const mongoose = require('mongoose');
const config = require('../env');
const logger = require('../../utils/logger');

let memoryServer = null;
let usingMemory = false;

mongoose.set('strictQuery', true);

const connectDB = async () => {
  let uri = config.mongoUri;

  if (!uri) {
    // Lazy-require so production installs that always set MONGODB_URI need not load it.
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      logger.warn('MONGODB_URI not set — starting an in-memory MongoDB (data is NOT persisted).');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      usingMemory = true;
    } catch (err) {
      logger.error(
        'No MONGODB_URI provided and mongodb-memory-server is unavailable. ' +
          'Set MONGODB_URI in backend/.env to a real MongoDB connection string.'
      );
      throw err;
    }
  }

  mongoose.connection.on('error', (err) => logger.error('MongoDB connection error:', err.message));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected.'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const { host, name } = mongoose.connection;
  logger.success(`MongoDB connected → ${usingMemory ? 'in-memory' : host}/${name}`);

  return mongoose.connection;
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = { connectDB, disconnectDB, mongoose, isMemory: () => usingMemory };
