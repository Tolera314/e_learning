"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendedCourses = exports.getTrendingSearches = exports.searchCourses = void 0;
const prisma_1 = require("../utils/prisma");
/**
 * @desc    Search courses and log the query
 * @route   GET /api/search
 * @access  Public/Private
 */
const searchCourses = async (req, res) => {
    const { q, category, level, limit = 20, page = 1 } = req.query;
    const query = q;
    const skip = (Number(page) - 1) * Number(limit);
    try {
        const where = {
            visibility: 'PUBLISHED',
            deletedAt: null,
            ...(category ? { category: category } : {}),
            ...(level ? { level: level } : {}),
            ...(query ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { shortDescription: { contains: query, mode: 'insensitive' } },
                    { instructor: { name: { contains: query, mode: 'insensitive' } } }
                ]
            } : {})
        };
        const [courses, total] = await Promise.all([
            prisma_1.prisma.course.findMany({
                where,
                include: {
                    instructor: { select: { name: true, avatar: true } },
                    _count: { select: { enrollments: true, reviews: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma_1.prisma.course.count({ where })
        ]);
        // Log the search asynchronously
        if (query && query.trim().length > 2) {
            prisma_1.prisma.searchLog.create({
                data: {
                    query: query.trim().toLowerCase(),
                    userId: req.user?.id || null,
                    resultsCount: total
                }
            }).catch((err) => console.error("Failed to log search:", err));
        }
        res.status(200).json({
            data: courses,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Search failed" });
    }
};
exports.searchCourses = searchCourses;
/**
 * @desc    Get trending searches (popular queries in last 7 days)
 * @route   GET /api/search/trending
 * @access  Public
 */
const getTrendingSearches = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const trending = await prisma_1.prisma.searchLog.groupBy({
            by: ['query'],
            where: {
                createdAt: { gte: sevenDaysAgo }
            },
            _count: {
                query: true
            },
            orderBy: {
                _count: {
                    query: 'desc'
                }
            },
            take: 10
        });
        res.status(200).json(trending.map((t) => ({
            query: t.query,
            count: t._count.query
        })));
    }
    catch (error) {
        console.error("Trending search error:", error);
        res.status(500).json({ message: "Failed to fetch trending searches" });
    }
};
exports.getTrendingSearches = getTrendingSearches;
/**
 * @desc    Get recommended courses based on user behavior
 * @route   GET /api/search/recommended
 * @access  Private
 */
const getRecommendedCourses = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        // Find recent searches by user
        const recentSearches = await prisma_1.prisma.searchLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { query: true }
        });
        const searchTerms = recentSearches.map((s) => s.query);
        // Find courses matching recent search terms or categories user has enrolled in
        const courses = await prisma_1.prisma.course.findMany({
            where: {
                visibility: 'PUBLISHED',
                deletedAt: null,
                OR: [
                    ...searchTerms.map((term) => ({ title: { contains: term, mode: 'insensitive' } })),
                    // Add more complex recommendation logic here if needed (e.g. based on category)
                ],
                NOT: {
                    enrollments: { some: { studentId: userId } } // Don't recommend already enrolled courses
                }
            },
            include: {
                instructor: { select: { name: true, avatar: true } },
                _count: { select: { enrollments: true } }
            },
            take: 6,
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(courses);
    }
    catch (error) {
        console.error("Recommendation error:", error);
        res.status(500).json({ message: "Failed to fetch recommendations" });
    }
};
exports.getRecommendedCourses = getRecommendedCourses;
