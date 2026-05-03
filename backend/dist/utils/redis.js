"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("./logger"));
const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required for BullMQ
};
const redisConnection = new ioredis_1.default(redisConfig);
redisConnection.on('error', (err) => {
    logger_1.default.error(err, 'Redis Connection Error');
});
redisConnection.on('connect', () => {
    logger_1.default.info('Connected to Redis successfully');
});
exports.default = redisConnection;
