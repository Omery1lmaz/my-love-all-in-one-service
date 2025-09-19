import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export class ExpoNotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo({
      accessToken: "IexaxTFSd_FldaKaVNnDSSwv-0lOiKIBfJK4qiYa", // Optional, for push notifications
      useFcmV1: true, // Use FCM v1 API
    });
  }

  /**
   * Tek bir kullanıcıya notification gönder
   */
  async sendNotificationToUser(
    expoPushToken: string,
    notification: NotificationData
  ): Promise<ExpoPushTicket | null> {
    try {
      // Expo push token'ın geçerli olup olmadığını kontrol et
      if (!Expo.isExpoPushToken(expoPushToken)) {
        console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
        return null;
      }

      const message: ExpoPushMessage = {
        to: expoPushToken,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
        channelId: notification.channelId,
      };

      const ticket = await this.expo.sendPushNotificationsAsync([message]);
      console.log('Notification sent successfully:', ticket[0]);
      return ticket[0];
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Birden fazla kullanıcıya notification gönder
   */
  async sendNotificationToMultipleUsers(
    expoPushTokens: string[],
    notification: NotificationData
  ): Promise<ExpoPushTicket[]> {
    try {
      const validTokens = expoPushTokens.filter(token => Expo.isExpoPushToken(token));

      if (validTokens.length === 0) {
        console.error('No valid Expo push tokens provided');
        return [];
      }

      const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
        channelId: notification.channelId,
      }));

      const tickets = await this.expo.sendPushNotificationsAsync(messages);
      console.log(`Notifications sent to ${tickets.length} users`);
      return tickets;
    } catch (error) {
      console.error('Error sending notifications to multiple users:', error);
      return [];
    }
  }

  /**
   * Chat mesajı için özel notification
   */
  async sendChatNotification(
    expoPushToken: string,
    senderName: string,
    message: string,
    chatRoomId: string
  ): Promise<ExpoPushTicket | null> {
    const notification: NotificationData = {
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
  }

  /**
   * Partner'dan gelen günlük şarkı için notification
   */
  async sendDailySongNotification(
    expoPushToken: string,
    partnerName: string,
    songName: string
  ): Promise<ExpoPushTicket | null> {
    const notification: NotificationData = {
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
  }

  /**
   * Partner'dan gelen mood güncellemesi için notification
   */
  async sendMoodUpdateNotification(
    expoPushToken: string,
    partnerName: string,
    mood: string
  ): Promise<ExpoPushTicket | null> {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      excited: '🤩',
      neutral: '😐',
    };

    const notification: NotificationData = {
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
  }

  /**
   * AI chat mesajı için notification
   */
  async sendAIChatNotification(
    expoPushToken: string,
    message: string
  ): Promise<ExpoPushTicket | null> {
    const notification: NotificationData = {
      title: 'AI Asistan',
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      data: {
        type: 'ai_chat',
      },
      sound: 'default',
      channelId: 'ai_chat',
    };

    return this.sendNotificationToUser(expoPushToken, notification);
  }

  /**
   * Test notification gönder
   */
  async sendTestNotification(expoPushToken: string): Promise<ExpoPushTicket | null> {
    const notification: NotificationData = {
      title: 'Test Bildirimi',
      body: 'Bu bir test bildirimidir. Uygulamanız çalışıyor! 🎉',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
      sound: 'default',
    };

    return this.sendNotificationToUser(expoPushToken, notification);
  }
}

// Singleton instance
export const expoNotificationService = new ExpoNotificationService();
