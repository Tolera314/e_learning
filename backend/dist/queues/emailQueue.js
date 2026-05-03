"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../utils/redis"));
const mail_1 = require("../utils/mail");
const logger_1 = __importDefault(require("../utils/logger"));
const EMAIL_QUEUE_NAME = 'email-queue';
exports.emailQueue = new bullmq_1.Queue(EMAIL_QUEUE_NAME, {
    connection: redis_1.default,
});
const emailWorker = new bullmq_1.Worker(EMAIL_QUEUE_NAME, async (job) => {
    const { email, otp, name, isPasswordReset } = job.data;
    logger_1.default.info(`Processing email job for ${email}`);
    try {
        const result = isPasswordReset
            ? await (0, mail_1.sendResetPasswordEmail)(email, otp, name)
            : await (0, mail_1.sendOTPEmail)(email, otp, name);
        if (!result.success) {
            throw new Error('Failed to send email');
        }
        return result;
    }
    catch (error) {
        logger_1.default.error(error, `Email job failed for ${email}`);
        throw error;
    }
}, {
    connection: redis_1.default,
    concurrency: 5,
});
emailWorker.on('completed', (job) => {
    logger_1.default.info(`Email job ${job.id} completed for ${job.data.email}`);
});
emailWorker.on('failed', (job, err) => {
    logger_1.default.error(err, `Email job ${job?.id} failed with error: ${err.message}`);
});
exports.default = exports.emailQueue;
