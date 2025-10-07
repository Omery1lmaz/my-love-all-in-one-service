import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { User } from '../Models/user';

export class NotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  async sendWeeklyReportNotification(userId: string, reportData: any): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.expoPushToken) {
        console.log('User not found or no push token');
        return;
      }

      const message: ExpoPushMessage = {
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

      await this.expo.sendPushNotificationsAsync([message]);
      console.log('Weekly report notification sent successfully');
    } catch (error) {
      console.error('Error sending weekly report notification:', error);
    }
  }

  async sendInsightNotification(userId: string, insight: any): Promise<void> {
    try {
      const user = await User.findById(userId);
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

      const message: ExpoPushMessage = {
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

      await this.expo.sendPushNotificationsAsync([message]);
      console.log('Insight notification sent successfully');
    } catch (error) {
      console.error('Error sending insight notification:', error);
    }
  }

  async sendGoalReminder(userId: string, goal: any): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.expoPushToken) {
        console.log('User not found or no push token');
        return;
      }

      const daysLeft = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      const message: ExpoPushMessage = {
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

      await this.expo.sendPushNotificationsAsync([message]);
      console.log('Goal reminder sent successfully');
    } catch (error) {
      console.error('Error sending goal reminder:', error);
    }
  }

  async sendGoalAchievementNotification(userId: string, goal: any): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.expoPushToken) {
        console.log('User not found or no push token');
        return;
      }

      const message: ExpoPushMessage = {
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

      await this.expo.sendPushNotificationsAsync([message]);
      console.log('Goal achievement notification sent successfully');
    } catch (error) {
      console.error('Error sending goal achievement notification:', error);
    }
  }

  async sendHealthScoreUpdateNotification(userId: string, healthScore: any): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.expoPushToken) {
        console.log('User not found or no push token');
        return;
      }

      let emoji = '';
      let message = '';

      if (healthScore.overall >= 80) {
        emoji = '💚';
        message = 'İlişkiniz çok sağlıklı!';
      } else if (healthScore.overall >= 60) {
        emoji = '💛';
        message = 'İlişkiniz iyi durumda!';
      } else {
        emoji = '❤️';
        message = 'İlişkinizde gelişim alanları var.';
      }

      const pushMessage: ExpoPushMessage = {
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

      await this.expo.sendPushNotificationsAsync([pushMessage]);
      console.log('Health score update notification sent successfully');
    } catch (error) {
      console.error('Error sending health score update notification:', error);
    }
  }

  async sendDailyCheckInReminder(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.expoPushToken) {
        console.log('User not found or no push token');
        return;
      }

      const message: ExpoPushMessage = {
        to: user.expoPushToken,
        sound: 'default',
        title: 'Günlük Kontrol Zamanı! 📝',
        body: 'Bugünkü ruh halinizi ve ilişki durumunuzu güncelleyin.',
        data: { 
          type: 'daily_checkin'
        },
        badge: 1
      };

      await this.expo.sendPushNotificationsAsync([message]);
      console.log('Daily check-in reminder sent successfully');
    } catch (error) {
      console.error('Error sending daily check-in reminder:', error);
    }
  }

  async sendMonthlyReportNotification(userId: string, reportData: any): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.expoPushToken) {
        console.log('User not found or no push token');
        return;
      }

      const message: ExpoPushMessage = {
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

      await this.expo.sendPushNotificationsAsync([message]);
      console.log('Monthly report notification sent successfully');
    } catch (error) {
      console.error('Error sending monthly report notification:', error);
    }
  }

  async sendCustomNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.expoPushToken) {
        console.log('User not found or no push token');
        return;
      }

      const message: ExpoPushMessage = {
        to: user.expoPushToken,
        sound: 'default',
        title,
        body,
        data: data || { type: 'custom' },
        badge: 1
      };

      await this.expo.sendPushNotificationsAsync([message]);
      console.log('Custom notification sent successfully');
    } catch (error) {
      console.error('Error sending custom notification:', error);
    }
  }

  // Batch notifications for multiple users
  async sendBatchNotifications(notifications: Array<{
    userId: string;
    title: string;
    body: string;
    data?: any;
  }>): Promise<void> {
    try {
      const messages: ExpoPushMessage[] = [];

      for (const notification of notifications) {
        const user = await User.findById(notification.userId);
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
        await this.expo.sendPushNotificationsAsync(messages);
        console.log(`Batch notifications sent successfully to ${messages.length} users`);
      }
    } catch (error) {
      console.error('Error sending batch notifications:', error);
    }
  }

  // Validate push token
  async validatePushToken(token: string): Promise<boolean> {
    try {
      return Expo.isExpoPushToken(token);
    } catch (error) {
      console.error('Error validating push token:', error);
      return false;
    }
  }
}

