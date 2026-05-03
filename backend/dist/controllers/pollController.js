"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePoll = exports.votePoll = exports.getSessionPolls = exports.createPoll = void 0;
const prisma_1 = require("../utils/prisma");
const socket_1 = require("../socket");
const security_1 = require("../utils/security");
const logger_1 = __importDefault(require("../utils/logger"));
const createPoll = async (req, res) => {
    try {
        const { liveSessionId, question, options, isAnonymous } = req.body;
        const instructorId = req.user?.id;
        if (!instructorId)
            return res.status(401).json({ error: "Unauthorized" });
        // Verify ownership of the live session's course
        const session = await prisma_1.prisma.liveSession.findUnique({
            where: { id: liveSessionId },
            include: { lesson: { include: { module: { select: { courseId: true } } } } }
        });
        if (!session || !(await (0, security_1.validateCourseOwnership)(session.lesson.module.courseId, instructorId))) {
            return res.status(403).json({ error: "Access denied: Not your session" });
        }
        if (!liveSessionId || !question || !options || !Array.isArray(options)) {
            return res.status(400).json({ error: 'Invalid poll data' });
        }
        const poll = await prisma_1.prisma.poll.create({
            data: {
                liveSessionId,
                question,
                isAnonymous: !!isAnonymous,
                options: {
                    create: options.map((opt, index) => ({
                        text: opt,
                        order: index
                    }))
                }
            },
            include: {
                options: true
            }
        });
        // Broadcast poll creation
        const io = (0, socket_1.getSocketServer)();
        if (io) {
            io.to(`session:${liveSessionId}`).emit('poll:new', poll);
        }
        res.status(201).json(poll);
    }
    catch (error) {
        logger_1.default.error({ error }, 'Failed to create poll');
        res.status(500).json({ error: 'Failed to create poll' });
    }
};
exports.createPoll = createPoll;
const getSessionPolls = async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;
    try {
        const polls = await prisma_1.prisma.poll.findMany({
            where: { liveSessionId: String(sessionId) },
            include: {
                options: {
                    orderBy: { order: 'asc' },
                    include: {
                        _count: {
                            select: { responses: true }
                        }
                    }
                },
                responses: {
                    where: { userId } // Check if current user has voted
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Format polls to include totals and user choice
        const formattedPolls = polls.map((poll) => {
            const totalVotes = poll.options.reduce((acc, opt) => acc + opt._count.responses, 0);
            return {
                ...poll,
                totalVotes,
                userHasVoted: poll.responses.length > 0,
                userOptionId: poll.responses[0]?.optionId,
                options: poll.options.map((opt) => ({
                    ...opt,
                    votes: opt._count.responses,
                    percentage: totalVotes > 0 ? Math.round((opt._count.responses / totalVotes) * 100) : 0
                }))
            };
        });
        res.json(formattedPolls);
    }
    catch (error) {
        logger_1.default.error({ error, sessionId }, 'Failed to fetch session polls');
        res.status(500).json({ error: 'Failed to fetch polls' });
    }
};
exports.getSessionPolls = getSessionPolls;
const votePoll = async (req, res) => {
    try {
        const { pollId, optionId } = req.body;
        const studentId = req.user?.id;
        if (!studentId)
            return res.status(401).json({ error: "Unauthorized" });
        // Security: Verify student is enrolled in the session's course
        const poll = await prisma_1.prisma.poll.findUnique({
            where: { id: pollId },
            include: { liveSession: { include: { lesson: { include: { module: { select: { courseId: true } } } } } } }
        });
        if (!poll || !(await (0, security_1.validateEnrollment)(poll.liveSession.lesson.module.courseId, studentId))) {
            return res.status(403).json({ error: "Access denied: Enrollment required to vote" });
        }
        if (!pollId || !optionId) {
            return res.status(400).json({ error: 'Invalid vote data' });
        }
        if (!poll.isOpen) {
            return res.status(400).json({ error: 'Poll is closed' });
        }
        // Upsert response
        const response = await prisma_1.prisma.pollResponse.upsert({
            where: {
                userId_pollId: {
                    userId: studentId,
                    pollId
                }
            },
            update: { optionId },
            create: {
                userId: studentId,
                pollId,
                optionId
            }
        });
        // Fetch updated results
        const updatedPoll = await prisma_1.prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    include: {
                        _count: { select: { responses: true } }
                    }
                }
            }
        });
        if (updatedPoll) {
            const totalVotes = updatedPoll.options.reduce((acc, opt) => acc + opt._count.responses, 0);
            const results = {
                pollId,
                totalVotes,
                options: updatedPoll.options.map((opt) => ({
                    id: opt.id,
                    votes: opt._count.responses,
                    percentage: totalVotes > 0 ? Math.round((opt._count.responses / totalVotes) * 100) : 0
                }))
            };
            // Broadcast results
            const io = (0, socket_1.getSocketServer)();
            if (io) {
                io.to(`session:${updatedPoll.liveSessionId}`).emit('poll:results', results);
            }
        }
        res.json(response);
    }
    catch (error) {
        logger_1.default.error({ error }, 'Failed to record poll vote');
        res.status(500).json({ error: 'Failed to vote' });
    }
};
exports.votePoll = votePoll;
const closePoll = async (req, res) => {
    const { pollId } = req.params;
    const instructorId = req.user.id;
    try {
        const poll = await prisma_1.prisma.poll.findUnique({
            where: { id: String(pollId) },
            include: {
                liveSession: {
                    include: {
                        lesson: {
                            include: {
                                module: {
                                    include: { course: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!poll)
            return res.status(404).json({ error: 'Poll not found' });
        if (poll.liveSession.lesson.module.course.instructorId !== instructorId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updatedPoll = await prisma_1.prisma.poll.update({
            where: { id: String(pollId) },
            data: { isOpen: false }
        });
        // Broadcast close event
        const io = (0, socket_1.getSocketServer)();
        if (io) {
            io.to(`session:${poll.liveSessionId}`).emit('poll:closed', { pollId });
        }
        res.json(updatedPoll);
    }
    catch (error) {
        logger_1.default.error({ error, pollId }, 'Failed to close poll');
        res.status(500).json({ error: 'Failed to close poll' });
    }
};
exports.closePoll = closePoll;
