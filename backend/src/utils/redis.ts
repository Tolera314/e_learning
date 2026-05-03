import Redis from 'ioredis';
import logger from './logger';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
};

const redisConnection = new Redis(redisConfig);

redisConnection.on('error', (err: Error) => {
  logger.error(err, 'Redis Connection Error');
});

redisConnection.on('connect', () => {
  logger.info('Connected to Redis successfully');
});

export default redisConnection;
