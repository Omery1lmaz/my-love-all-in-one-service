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
exports.NotificationService = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
const user_1 = require("../Models/user");
class NotificationService {
    constructor() {
        this.expo = new expo_server_sdk_1.Expo();
    }
    sendWeeklyReportNotification(userId, reportData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user || !user.expoPushToken) {
                    console.log('User not found or no push token');
                    return;
                }
                const message = {
                    to: user.expoPushToken,
                    sound: 'default',
                    title: 'Haftalık İlişki Raporunuz Hazır! 📊',
                    body: `Sağlık skorunuz: ${reportData.healthScore.overall}/100`,
                    data: {
                        type: 'weekly_report',
                        reportId: reportData._id
                    },
                    badge: 1
                };
                yield this.expo.sendPushNotificationsAsync([message]);
                console.log('Weekly report notification sent successfully');
            }
            catch (error) {
                console.error('Error sending weekly report notification:', error);
            }
        });
    }
    sendInsightNotification(userId, insight) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user || !user.expoPushToken) {
                    console.log('User not found or no push token');
                    return;
                }
                let title = '';
                let body = '';
                switch (insight.type) {
                    case 'positive':
                        title = 'Harika Haber! 🎉';
                        body = insight.title;
                        break;
                    case 'warning':
                        title = 'Dikkat Edilmesi Gereken Alan ⚠️';
                        body = insight.title;
                        break;
                    case 'suggestion':
                        title = 'Yeni Öneri 💡';
                        body = insight.title;
                        break;
                    case 'achievement':
                        title = 'Başarı Rozeti Kazandınız! 🏆';
                        body = insight.title;
                        break;
                    default:
                        title = 'Yeni İçgörü 📈';
                        body = insight.title;
                }
                const message = {
                    to: user.expoPushToken,
                    sound: 'default',
                    title,
                    body,
                    data: {
                        type: 'insight',
                        insightId: insight._id,
                        insightType: insight.type
                    },
                    badge: 1
                };
                yield this.expo.sendPushNotificationsAsync([message]);
                console.log('Insight notification sent successfully');
            }
            catch (error) {
                console.error('Error sending insight notification:', error);
            }
        });
    }
    sendGoalReminder(userId, goal) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user || !user.expoPushToken) {
                    console.log('User not found or no push token');
                    return;
                }
                const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const message = {
                    to: user.expoPushToken,
                    sound: 'default',
                    title: 'Hedef Hatırlatması 🎯',
                    body: `"${goal.title}" hedefinize ${daysLeft} gün kaldı!`,
                    data: {
                        type: 'goal_reminder',
                        goalId: goal._id
                    },
                    badge: 1
                };
                yield this.expo.sendPushNotificationsAsync([message]);
                console.log('Goal reminder sent successfully');
            }
            catch (error) {
                console.error('Error sending goal reminder:', error);
            }
        });
    }
    sendGoalAchievementNotification(userId, goal) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user || !user.expoPushToken) {
                    console.log('User not found or no push token');
                    return;
                }
                const message = {
                    to: user.expoPushToken,
                    sound: 'default',
                    title: 'Tebrikler! Hedefinizi Tamamladınız! 🎉',
                    body: `"${goal.title}" hedefini başarıyla tamamladınız!`,
                    data: {
                        type: 'goal_achievement',
                        goalId: goal._id
                    },
                    badge: 1
                };
                yield this.expo.sendPushNotificationsAsync([message]);
                console.log('Goal achievement notification sent successfully');
            }
            catch (error) {
                console.error('Error sending goal achievement notification:', error);
            }
        });
    }
    sendHealthScoreUpdateNotification(userId, healthScore) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user || !user.expoPushToken) {
                    console.log('User not found or no push token');
                    return;
                }
                let emoji = '';
                let message = '';
                if (healthScore.overall >= 80) {
                    emoji = '💚';
                    message = 'İlişkiniz çok sağlıklı!';
                }
                else if (healthScore.overall >= 60) {
                    emoji = '💛';
                    message = 'İlişkiniz iyi durumda!';
                }
                else {
                    emoji = '❤️';
                    message = 'İlişkinizde gelişim alanları var.';
                }
                const pushMessage = {
                    to: user.expoPushToken,
                    sound: 'default',
                    title: `Sağlık Skoru Güncellendi ${emoji}`,
                    body: `${message} Skor: ${healthScore.overall}/100`,
                    data: {
                        type: 'health_score_update',
                        healthScoreId: healthScore._id
                    },
                    badge: 1
                };
                yield this.expo.sendPushNotificationsAsync([pushMessage]);
                console.log('Health score update notification sent successfully');
            }
            catch (error) {
                console.error('Error sending health score update notification:', error);
            }
        });
    }
    sendDailyCheckInReminder(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user || !user.expoPushToken) {
                    console.log('User not found or no push token');
                    return;
                }
                const message = {
                    to: user.expoPushToken,
                    sound: 'default',
                    title: 'Günlük Kontrol Zamanı! 📝',
                    body: 'Bugünkü ruh halinizi ve ilişki durumunuzu güncelleyin.',
                    data: {
                        type: 'daily_checkin'
                    },
                    badge: 1
                };
                yield this.expo.sendPushNotificationsAsync([message]);
                console.log('Daily check-in reminder sent successfully');
            }
            catch (error) {
                console.error('Error sending daily check-in reminder:', error);
            }
        });
    }
    sendMonthlyReportNotification(userId, reportData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user || !user.expoPushToken) {
                    console.log('User not found or no push token');
                    return;
                }
                const message = {
                    to: user.expoPushToken,
                    sound: 'default',
                    title: 'Aylık İlişki Raporunuz Hazır! 📊',
                    body: `Bu ayki sağlık skorunuz: ${reportData.healthScore.overall}/100`,
                    data: {
                        type: 'monthly_report',
                        reportId: reportData._id
                    },
                    badge: 1
                };
                yield this.expo.sendPushNotificationsAsync([message]);
                console.log('Monthly report notification sent successfully');
            }
            catch (error) {
                console.error('Error sending monthly report notification:', error);
            }
        });
    }
    sendCustomNotification(userId, title, body, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.User.findById(userId);
                if (!user || !user.expoPushToken) {
                    console.log('User not found or no push token');
                    return;
                }
                const message = {
                    to: user.expoPushToken,
                    sound: 'default',
                    title,
                    body,
                    data: data || { type: 'custom' },
                    badge: 1
                };
                yield this.expo.sendPushNotificationsAsync([message]);
                console.log('Custom notification sent successfully');
            }
            catch (error) {
                console.error('Error sending custom notification:', error);
            }
        });
    }
    // Batch notifications for multiple users
    sendBatchNotifications(notifications) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = [];
                for (const notification of notifications) {
                    const user = yield user_1.User.findById(notification.userId);
                    if (user && user.expoPushToken) {
                        messages.push({
                            to: user.expoPushToken,
                            sound: 'default',
                            title: notification.title,
                            body: notification.body,
                            data: notification.data || { type: 'batch' },
                            badge: 1
                        });
                    }
                }
                if (messages.length > 0) {
                    yield this.expo.sendPushNotificationsAsync(messages);
                    console.log(`Batch notifications sent successfully to ${messages.length} users`);
                }
            }
            catch (error) {
                console.error('Error sending batch notifications:', error);
            }
        });
    }
    // Validate push token
    validatePushToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return expo_server_sdk_1.Expo.isExpoPushToken(token);
            }
            catch (error) {
                console.error('Error validating push token:', error);
                return false;
            }
        });
    }
}
exports.NotificationService = NotificationService;
