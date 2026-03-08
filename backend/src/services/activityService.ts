import { prisma } from '../utils/prisma';
import logger from '../utils/logger';

/**
 * In-memory debounce buffer for activity logs.
 * Keyed by `${studentId}:${courseId}:${action}`.
 * Flushes to PostgreSQL every 30 seconds in bulk.
 */
const activityBuffer = new Map<string, {
  studentId: string;
  courseId: string | null;
  action: string;
  metadata: string | null;
  timestamp: Date;
}>();

export function recordActivity(
  studentId: string,
  action: string,
  courseId?: string,
  metadata?: Record<string, unknown>
) {
  const key = `${studentId}:${courseId ?? 'global'}:${action}`;
  activityBuffer.set(key, {
    studentId,
    courseId: courseId ?? null,
    action,
    metadata: metadata ? JSON.stringify(metadata) : null,
    timestamp: new Date(),
  });
}

async function flushActivityBuffer() {
  if (activityBuffer.size === 0) return;
  const entries = Array.from(activityBuffer.values());
  activityBuffer.clear();

  try {
    await prisma.studentActivityLog.createMany({
      data: entries.map(e => ({
        studentId: e.studentId,
        courseId: e.courseId,
        action: e.action,
        metadata: e.metadata,
        createdAt: e.timestamp,
      })),
      skipDuplicates: true,
    });
    logger.debug({ count: entries.length }, 'Activity logs flushed to DB');
  } catch (err) {
    logger.error({ err }, 'Failed to flush activity logs');
    // Re-buffer entries on failure so they are not lost
    entries.forEach(e => {
      const key = `${e.studentId}:${e.courseId ?? 'global'}:${e.action}`;
      activityBuffer.set(key, e);
    });
  }
}

// Flush every 30 seconds
const FLUSH_INTERVAL_MS = 30_000;
let flushTimer: NodeJS.Timeout;

export function startActivityFlusher() {
  flushTimer = setInterval(flushActivityBuffer, FLUSH_INTERVAL_MS);
  logger.info('Activity log batcher started (30s flush interval)');
}

export function stopActivityFlusher() {
  clearInterval(flushTimer);
  // Flush remaining items on shutdown
  return flushActivityBuffer();
}
