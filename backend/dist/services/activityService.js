"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordActivity = recordActivity;
exports.startActivityFlusher = startActivityFlusher;
exports.stopActivityFlusher = stopActivityFlusher;
const prisma_1 = require("../utils/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * In-memory debounce buffer for activity logs.
 * Keyed by `${studentId}:${courseId}:${action}`.
 * Flushes to PostgreSQL every 30 seconds in bulk.
 */
const activityBuffer = new Map();
function recordActivity(studentId, action, courseId, metadata) {
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
    if (activityBuffer.size === 0)
        return;
    const entries = Array.from(activityBuffer.values());
    activityBuffer.clear();
    try {
        await prisma_1.prisma.studentActivityLog.createMany({
            data: entries.map(e => ({
                studentId: e.studentId,
                courseId: e.courseId,
                action: e.action,
                metadata: e.metadata,
                createdAt: e.timestamp,
            })),
            skipDuplicates: true,
        });
        logger_1.default.debug({ count: entries.length }, 'Activity logs flushed to DB');
    }
    catch (err) {
        logger_1.default.error({ err }, 'Failed to flush activity logs');
        // Re-buffer entries on failure so they are not lost
        entries.forEach(e => {
            const key = `${e.studentId}:${e.courseId ?? 'global'}:${e.action}`;
            activityBuffer.set(key, e);
        });
    }
}
// Flush every 30 seconds
const FLUSH_INTERVAL_MS = 30_000;
let flushTimer;
function startActivityFlusher() {
    flushTimer = setInterval(flushActivityBuffer, FLUSH_INTERVAL_MS);
    logger_1.default.info('Activity log batcher started (30s flush interval)');
}
function stopActivityFlusher() {
    clearInterval(flushTimer);
    // Flush remaining items on shutdown
    return flushActivityBuffer();
}
