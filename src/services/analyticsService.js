"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const healthScore_1 = require("../Models/healthScore");
const goal_1 = require("../Models/goal");
const insight_1 = require("../Models/insight");
const report_1 = require("../Models/report");
const chat_1 = require("../Models/chat");
const dailyJournal_1 = require("../Models/dailyJournal");
const event_1 = require("../Models/event");
const photo_1 = require("../Models/photo");
class AnalyticsService {
    // Health Score Calculation
    calculateHealthScore(userId, partnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get data from last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                // Get communication data
                const messages = yield chat_1.Chat.find({
                    $or: [
                        { senderId: userId, receiverId: partnerId },
                        { senderId: partnerId, receiverId: userId }
                    ],
                    createdAt: { $gte: thirtyDaysAgo }
                }).sort({ createdAt: 1 });
                // Get mood data
                const userMoods = yield dailyJournal_1.DailyJournal.find({
                    userId: userId,
                    createdAt: { $gte: thirtyDaysAgo }
                }).select('mood createdAt');
                const partnerMoods = yield dailyJournal_1.DailyJournal.find({
                    userId: partnerId,
                    createdAt: { $gte: thirtyDaysAgo }
                }).select('mood createdAt');
                // Get activity data
                const events = yield event_1.Event.find({
                    $or: [
                        { userId: userId },
                        { partnerId: partnerId }
                    ],
                    createdAt: { $gte: thirtyDaysAgo }
                });
                const photos = yield photo_1.Photo.find({
                    $or: [
                        { userId: userId },
                        { userId: partnerId }
                    ],
                    createdAt: { $gte: thirtyDaysAgo }
                });
                // Calculate individual scores
                const communicationScore = this.calculateCommunicationScore(messages);
                const intimacyScore = this.calculateIntimacyScore(events, photos);
                const trustScore = this.calculateTrustScore(messages, events);
                const satisfactionScore = this.calculateSatisfactionScore(userMoods, partnerMoods);
                const conflictResolutionScore = this.calculateConflictResolutionScore(messages);
                // Calculate overall score
                const overallScore = this.calculateOverallScore({
                    communication: communicationScore,
                    intimacy: intimacyScore,
                    trust: trustScore,
                    satisfaction: satisfactionScore,
                    conflictResolution: conflictResolutionScore
                });
                // Prepare data points
                const dataPoints = {
                    messageCount: messages.length,
                    responseTime: this.calculateAverageResponseTime(messages),
                    positiveSentiment: this.calculatePositiveSentiment(messages),
                    activityEngagement: events.length + photos.length,
                    conflictCount: this.countConflicts(messages),
                    moodScores: [...userMoods.map(m => m.mood), ...partnerMoods.map(m => m.mood)]
                };
                // Save health score
                const healthScore = healthScore_1.HealthScore.build({
                    userId,
                    partnerId,
                    overall: overallScore,
                    communication: communicationScore,
                    intimacy: intimacyScore,
                    trust: trustScore,
                    satisfaction: satisfactionScore,
                    conflictResolution: conflictResolutionScore,
                    dataPoints
                });
                yield healthScore.save();
                return healthScore;
            }
            catch (error) {
                console.error('Error calculating health score:', error);
                throw error;
            }
        });
    }
    // Get latest health score
    getLatestHealthScore(userId, partnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const healthScore = yield healthScore_1.HealthScore.findOne({
                    $or: [
                        { userId, partnerId },
                        { userId: partnerId, partnerId: userId }
                    ]
                }).sort({ calculatedAt: -1 });
                return healthScore;
            }
            catch (error) {
                console.error('Error getting health score:', error);
                throw error;
            }
        });
    }
    // Get health score history
    getHealthScoreHistory(userId_1, partnerId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, partnerId, limit = 30) {
            try {
                const healthScores = yield healthScore_1.HealthScore.find({
                    $or: [
                        { userId, partnerId },
                        { userId: partnerId, partnerId: userId }
                    ]
                }).sort({ calculatedAt: -1 }).limit(limit);
                return healthScores;
            }
            catch (error) {
                console.error('Error getting health score history:', error);
                throw error;
            }
        });
    }
    // Goal Management
    createGoal(goalData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const goal = goal_1.Goal.build(goalData);
                yield goal.save();
                return goal;
            }
            catch (error) {
                console.error('Error creating goal:', error);
                throw error;
            }
        });
    }
    getGoals(userId, partnerId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = {
                    $or: [
                        { userId, partnerId },
                        { userId: partnerId, partnerId: userId }
                    ]
                };
                if (status) {
                    query.status = status;
                }
                const goals = yield goal_1.Goal.find(query).sort({ createdAt: -1 });
                return goals;
            }
            catch (error) {
                console.error('Error getting goals:', error);
                throw error;
            }
        });
    }
    updateGoalProgress(goalId, currentValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const goal = yield goal_1.Goal.findById(goalId);
                if (!goal) {
                    throw new Error('Goal not found');
                }
                goal.currentValue = currentValue;
                goal.progress = Math.min(100, (currentValue / goal.targetValue) * 100);
                if (goal.progress >= 100) {
                    goal.status = 'completed';
                }
                yield goal.save();
                return goal;
            }
            catch (error) {
                console.error('Error updating goal progress:', error);
                throw error;
            }
        });
    }
    // Insight Generation
    generateInsights(userId, partnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const healthScore = yield this.getLatestHealthScore(userId, partnerId);
                if (!healthScore) {
                    throw new Error('No health score found');
                }
                const insights = [];
                // Generate insights based on health score
                if (healthScore.communication < 50) {
                    insights.push({
                        userId,
                        partnerId,
                        type: 'warning',
                        title: 'İletişim Kalitesi Düşük',
                        description: 'İletişim skorunuz düşük. Daha sık ve kaliteli iletişim kurmaya odaklanın.',
                        impact: 'high',
                        category: 'communication',
                        actionable: true,
                        actionItems: [
                            'Günlük sohbet rutini oluşturun',
                            'Aktif dinleme pratiği yapın',
                            'Duygularınızı açıkça ifade edin'
                        ],
                        confidence: 85
                    });
                }
                if (healthScore.intimacy < 40) {
                    insights.push({
                        userId,
                        partnerId,
                        type: 'suggestion',
                        title: 'Yakınlık Seviyesi Artırılabilir',
                        description: 'Yakınlık skorunuz geliştirilebilir. Ortak aktiviteler ve kaliteli zaman geçirin.',
                        impact: 'medium',
                        category: 'intimacy',
                        actionable: true,
                        actionItems: [
                            'Haftalık date night planlayın',
                            'Fiziksel teması artırın',
                            'Ortak hobiler bulun'
                        ],
                        confidence: 75
                    });
                }
                if (healthScore.overall > 80) {
                    insights.push({
                        userId,
                        partnerId,
                        type: 'positive',
                        title: 'Harika İlişki Sağlığı!',
                        description: 'İlişkiniz çok sağlıklı görünüyor. Bu pozitif trendi sürdürmeye devam edin.',
                        impact: 'low',
                        category: 'communication',
                        actionable: false,
                        actionItems: [],
                        confidence: 90
                    });
                }
                // Save insights
                const savedInsights = [];
                for (const insightData of insights) {
                    const insight = insight_1.Insight.build(insightData);
                    yield insight.save();
                    savedInsights.push(insight);
                }
                return savedInsights;
            }
            catch (error) {
                console.error('Error generating insights:', error);
                throw error;
            }
        });
    }
    getInsights(userId, partnerId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = {
                    $or: [
                        { userId, partnerId },
                        { userId: partnerId, partnerId: userId }
                    ]
                };
                if (type) {
                    query.type = type;
                }
                const insights = yield insight_1.Insight.find(query).sort({ createdAt: -1 });
                return insights;
            }
            catch (error) {
                console.error('Error getting insights:', error);
                throw error;
            }
        });
    }
    // Report Generation
    generateWeeklyReport(userId, partnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                // Get data for the week
                const messages = yield chat_1.Chat.find({
                    $or: [
                        { senderId: userId, receiverId: partnerId },
                        { senderId: partnerId, receiverId: userId }
                    ],
                    createdAt: { $gte: weekAgo }
                });
                const events = yield event_1.Event.find({
                    $or: [
                        { userId: userId },
                        { partnerId: partnerId }
                    ],
                    createdAt: { $gte: weekAgo }
                });
                const photos = yield photo_1.Photo.find({
                    $or: [
                        { userId: userId },
                        { userId: partnerId }
                    ],
                    createdAt: { $gte: weekAgo }
                });
                const healthScore = yield this.calculateHealthScore(userId, partnerId);
                // Generate report data
                const reportData = {
                    userId,
                    partnerId,
                    type: 'weekly',
                    periodStart: weekAgo,
                    periodEnd: new Date(),
                    healthScore: {
                        overall: healthScore.overall,
                        communication: healthScore.communication,
                        intimacy: healthScore.intimacy,
                        trust: healthScore.trust,
                        satisfaction: healthScore.satisfaction,
                        conflictResolution: healthScore.conflictResolution
                    },
                    communicationPattern: {
                        frequency: {
                            daily: messages.length / 7,
                            weekly: messages.length,
                            monthly: messages.length * 4
                        },
                        quality: {
                            positive: this.calculatePositiveSentiment(messages),
                            neutral: 30,
                            negative: 20
                        },
                        responseTime: {
                            average: this.calculateAverageResponseTime(messages),
                            consistency: 85
                        },
                        topics: {
                            romantic: 25,
                            daily: 40,
                            future: 15,
                            problems: 10,
                            fun: 10
                        }
                    },
                    moodTrends: [],
                    activityEngagement: [
                        {
                            category: 'Events',
                            frequency: events.length,
                            duration: events.reduce((sum, event) => sum + (event.duration || 0), 0),
                            satisfaction: 8,
                            trend: 'increasing'
                        },
                        {
                            category: 'Photos',
                            frequency: photos.length,
                            duration: 0,
                            satisfaction: 9,
                            trend: 'stable'
                        }
                    ],
                    conflictAnalysis: {
                        frequency: this.countConflicts(messages),
                        intensity: 3,
                        resolutionTime: 2,
                        topics: ['Communication', 'Time management'],
                        resolutionMethods: {
                            discussion: 70,
                            compromise: 20,
                            avoidance: 5,
                            external_help: 5
                        }
                    },
                    insights: [],
                    recommendations: {
                        immediate: [
                            'Daha sık iletişim kurun',
                            'Ortak aktiviteler planlayın'
                        ],
                        shortTerm: [
                            'Haftalık değerlendirme yapın',
                            'Yeni hobiler keşfedin'
                        ],
                        longTerm: [
                            'İlişki hedefleri belirleyin',
                            'Profesyonel destek almayı düşünün'
                        ]
                    },
                    achievements: [
                        {
                            title: 'İletişim Şampiyonu',
                            description: 'Bu hafta çok iyi iletişim kurdunuz',
                            badge: 'communication_badge'
                        }
                    ],
                    challenges: [
                        {
                            title: '7 Günlük İletişim Meydan Okuması',
                            description: 'Her gün en az 10 mesaj gönderin',
                            difficulty: 'medium',
                            reward: 'İletişim rozeti'
                        }
                    ]
                };
                const report = report_1.Report.build(reportData);
                yield report.save();
                return report;
            }
            catch (error) {
                console.error('Error generating weekly report:', error);
                throw error;
            }
        });
    }
    // Helper methods for calculations
    calculateCommunicationScore(messages) {
        if (messages.length === 0)
            return 0;
        const frequency = Math.min(100, (messages.length / 30) * 100); // 30 messages per day = 100%
        const responseTime = this.calculateAverageResponseTime(messages);
        const sentiment = this.calculatePositiveSentiment(messages);
        return Math.round((frequency + responseTime + sentiment) / 3);
    }
    calculateIntimacyScore(events, photos) {
        const eventScore = Math.min(100, (events.length / 10) * 100); // 10 events per month = 100%
        const photoScore = Math.min(100, (photos.length / 20) * 100); // 20 photos per month = 100%
        return Math.round((eventScore + photoScore) / 2);
    }
    calculateTrustScore(messages, events) {
        // Simple trust calculation based on consistency
        const messageConsistency = messages.length > 0 ? 80 : 0;
        const eventConsistency = events.length > 0 ? 70 : 0;
        return Math.round((messageConsistency + eventConsistency) / 2);
    }
    calculateSatisfactionScore(userMoods, partnerMoods) {
        const allMoods = [...userMoods.map(m => m.mood), ...partnerMoods.map(m => m.mood)];
        if (allMoods.length === 0)
            return 50;
        const averageMood = allMoods.reduce((sum, mood) => sum + mood, 0) / allMoods.length;
        return Math.round((averageMood / 10) * 100); // Assuming mood is 1-10 scale
    }
    calculateConflictResolutionScore(messages) {
        const conflicts = this.countConflicts(messages);
        const totalMessages = messages.length;
        if (totalMessages === 0)
            return 50;
        const conflictRatio = conflicts / totalMessages;
        return Math.max(0, 100 - (conflictRatio * 200)); // Lower conflict ratio = higher score
    }
    calculateOverallScore(scores) {
        const weights = {
            communication: 0.25,
            intimacy: 0.20,
            trust: 0.20,
            satisfaction: 0.20,
            conflictResolution: 0.15
        };
        let totalScore = 0;
        for (const [key, weight] of Object.entries(weights)) {
            totalScore += scores[key] * weight;
        }
        return Math.round(totalScore);
    }
    calculateAverageResponseTime(messages) {
        if (messages.length < 2)
            return 50;
        let totalTime = 0;
        let responseCount = 0;
        for (let i = 1; i < messages.length; i++) {
            const prevMessage = messages[i - 1];
            const currentMessage = messages[i];
            if (prevMessage.senderId !== currentMessage.senderId) {
                const timeDiff = currentMessage.createdAt.getTime() - prevMessage.createdAt.getTime();
                totalTime += timeDiff;
                responseCount++;
            }
        }
        if (responseCount === 0)
            return 50;
        const avgTimeMinutes = totalTime / responseCount / (1000 * 60);
        // Convert to score (0-100): < 1 hour = 100, > 24 hours = 0
        if (avgTimeMinutes < 60)
            return 100;
        if (avgTimeMinutes > 1440)
            return 0;
        return Math.round(100 - ((avgTimeMinutes - 60) / 1380) * 100);
    }
    calculatePositiveSentiment(messages) {
        var _a;
        if (messages.length === 0)
            return 50;
        // Simple sentiment analysis based on message content
        let positiveCount = 0;
        const positiveWords = ['love', 'happy', 'great', 'amazing', 'wonderful', 'beautiful', 'sevgili', 'mutlu', 'harika', 'güzel'];
        const negativeWords = ['hate', 'angry', 'sad', 'terrible', 'awful', 'nefret', 'kızgın', 'üzgün', 'kötü'];
        for (const message of messages) {
            const content = ((_a = message.content) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            const positiveWordsFound = positiveWords.filter(word => content.includes(word)).length;
            const negativeWordsFound = negativeWords.filter(word => content.includes(word)).length;
            if (positiveWordsFound > negativeWordsFound) {
                positiveCount++;
            }
        }
        return Math.round((positiveCount / messages.length) * 100);
    }
    countConflicts(messages) {
        var _a;
        const conflictKeywords = ['fight', 'argument', 'disagree', 'problem', 'issue', 'kavga', 'tartışma', 'anlaşmazlık', 'sorun'];
        let conflictCount = 0;
        for (const message of messages) {
            const content = ((_a = message.content) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
            if (conflictKeywords.some(keyword => content.includes(keyword))) {
                conflictCount++;
            }
        }
        return conflictCount;
    }
}
exports.AnalyticsService = AnalyticsService;
