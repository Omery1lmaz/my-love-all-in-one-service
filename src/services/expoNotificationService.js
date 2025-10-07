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
exports.expoNotificationService = exports.ExpoNotificationService = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
class ExpoNotificationService {
    constructor() {
        this.expo = new expo_server_sdk_1.Expo({
            accessToken: "IexaxTFSd_FldaKaVNnDSSwv-0lOiKIBfJK4qiYa", // Optional, for push notifications
            useFcmV1: true, // Use FCM v1 API
        });
    }
    /**
     * Tek bir kullanıcıya notification gönder
     */
    sendNotificationToUser(expoPushToken, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Expo push token'ın geçerli olup olmadığını kontrol et
                if (!expo_server_sdk_1.Expo.isExpoPushToken(expoPushToken)) {
                    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
                    return null;
                }
                const message = {
                    to: expoPushToken,
                    sound: notification.sound || 'default',
                    title: notification.title,
                    body: notification.body,
                    data: notification.data || {},
                    badge: notification.badge,
                    channelId: notification.channelId,
                };
                const ticket = yield this.expo.sendPushNotificationsAsync([message]);
                console.log('Notification sent successfully:', ticket[0]);
                return ticket[0];
            }
            catch (error) {
                console.error('Error sending notification:', error);
                return null;
            }
        });
    }
    /**
     * Birden fazla kullanıcıya notification gönder
     */
    sendNotificationToMultipleUsers(expoPushTokens, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validTokens = expoPushTokens.filter(token => expo_server_sdk_1.Expo.isExpoPushToken(token));
                if (validTokens.length === 0) {
                    console.error('No valid Expo push tokens provided');
                    return [];
                }
                const messages = validTokens.map(token => ({
                    to: token,
                    sound: notification.sound || 'default',
                    title: notification.title,
                    body: notification.body,
                    data: notification.data || {},
                    badge: notification.badge,
                    channelId: notification.channelId,
                }));
                const tickets = yield this.expo.sendPushNotificationsAsync(messages);
                console.log(`Notifications sent to ${tickets.length} users`);
                return tickets;
            }
            catch (error) {
                console.error('Error sending notifications to multiple users:', error);
                return [];
            }
        });
    }
    /**
     * Chat mesajı için özel notification
     */
    sendChatNotification(expoPushToken, senderName, message, chatRoomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = {
                title: `Yeni mesaj: ${senderName}`,
                body: message.length > 100 ? message.substring(0, 100) + '...' : message,
                data: {
                    type: 'chat_message',
                    chatRoomId,
                    senderName,
                },
                sound: 'default',
                badge: 1,
                channelId: 'chat_messages',
            };
            return this.sendNotificationToUser(expoPushToken, notification);
        });
    }
    /**
     * Partner'dan gelen günlük şarkı için notification
     */
    sendDailySongNotification(expoPushToken, partnerName, songName) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = {
                title: `${partnerName} bugünkü şarkısını paylaştı!`,
                body: `🎵 ${songName}`,
                data: {
                    type: 'daily_song',
                    partnerName,
                    songName,
                },
                sound: 'default',
                channelId: 'daily_songs',
            };
            return this.sendNotificationToUser(expoPushToken, notification);
        });
    }
    /**
     * Partner'dan gelen mood güncellemesi için notification
     */
    sendMoodUpdateNotification(expoPushToken, partnerName, mood) {
        return __awaiter(this, void 0, void 0, function* () {
            const moodEmojis = {
                happy: '😊',
                sad: '😢',
                excited: '🤩',
                neutral: '😐',
            };
            const notification = {
                title: `${partnerName} ruh halini güncelledi`,
                body: `${moodEmojis[mood] || '😊'} ${mood}`,
                data: {
                    type: 'mood_update',
                    partnerName,
                    mood,
                },
                sound: 'default',
                channelId: 'mood_updates',
            };
            return this.sendNotificationToUser(expoPushToken, notification);
        });
    }
    /**
     * AI chat mesajı için notification
     */
    sendAIChatNotification(expoPushToken, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = {
                title: 'AI Asistan',
                body: message.length > 100 ? message.substring(0, 100) + '...' : message,
                data: {
                    type: 'ai_chat',
                },
                sound: 'default',
                channelId: 'ai_chat',
            };
            return this.sendNotificationToUser(expoPushToken, notification);
        });
    }
    /**
     * Test notification gönder
     */
    sendTestNotification(expoPushToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = {
                title: 'Test Bildirimi',
                body: 'Bu bir test bildirimidir. Uygulamanız çalışıyor! 🎉',
                data: {
                    type: 'test',
                    timestamp: new Date().toISOString(),
                },
                sound: 'default',
            };
            return this.sendNotificationToUser(expoPushToken, notification);
        });
    }
}
exports.ExpoNotificationService = ExpoNotificationService;
// Singleton instance
exports.expoNotificationService = new ExpoNotificationService();
