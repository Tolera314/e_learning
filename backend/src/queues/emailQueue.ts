import { Queue, Worker, Job } from 'bullmq';
import redisConnection from '../utils/redis';
import { sendOTPEmail, sendResetPasswordEmail } from '../utils/mail';
import logger from '../utils/logger';

interface EmailJobData {
  email: string;
  otp: string;
  name: string;
  isPasswordReset?: boolean;
}

const EMAIL_QUEUE_NAME = 'email-queue';

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
});

const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJobData>) => {
    const { email, otp, name, isPasswordReset } = job.data;
    logger.info(`Processing email job for ${email}`);
    
    try {
      const result = isPasswordReset 
        ? await sendResetPasswordEmail(email, otp, name)
        : await sendOTPEmail(email, otp, name);
      if (!result.success) {
        throw new Error('Failed to send email');
      }
      return result;
    } catch (error: any) {
      logger.error(error, `Email job failed for ${email}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

emailWorker.on('completed', (job: Job) => {
  logger.info(`Email job ${job.id} completed for ${job.data.email}`);
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(err, `Email job ${job?.id} failed with error: ${err.message}`);
});

export default emailQueue;
