import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AIService } from '../services/aiService';
import { NotificationService } from '../services/notificationService';
import { Insight } from '../Models/insight';

const analyticsService = new AnalyticsService();
const aiService = new AIService();
const notificationService = new NotificationService();

export const getInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.query.partnerId as string;
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    const insights = await analyticsService.getInsights(userId, partnerId, type);

    // Limit results
    const limitedInsights = insights.slice(0, limit);

    res.status(200).json({
      success: true,
      data: limitedInsights,
      count: limitedInsights.length,
      total: insights.length
    });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const generateInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.body.partnerId;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    const insights = await analyticsService.generateInsights(userId, partnerId);

    // Send notifications for new insights
    for (const insight of insights) {
      await notificationService.sendInsightNotification(userId, insight);
    }

    res.status(200).json({
      success: true,
      data: insights,
      count: insights.length,
      message: 'Insights generated successfully'
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const generateAIInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.body.partnerId;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    // Get latest health score
    const healthScore = await analyticsService.getLatestHealthScore(userId, partnerId);
    if (!healthScore) {
      return res.status(404).json({
        success: false,
        message: 'No health score found. Please calculate health score first.'
      });
    }

    // Generate AI insights
    const aiInsights = await aiService.generateInsights(healthScore);

    // Save insights to database
    const savedInsights = [];
    for (const insightData of aiInsights) {
      const insight = Insight.build({
        userId,
        partnerId,
        ...insightData
      });
      await insight.save();
      savedInsights.push(insight);

      // Send notification
      await notificationService.sendInsightNotification(userId, insight);
    }

    res.status(200).json({
      success: true,
      data: savedInsights,
      count: savedInsights.length,
      message: 'AI insights generated successfully'
    });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getInsightById = async (req: Request, res: Response) => {
  try {
    const insightId = req.params.id;
    const userId = req.currentUser?.id;

    if (!insightId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Insight ID and User ID are required'
      });
    }

    const insight = await Insight.findById(insightId);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: 'Insight not found'
      });
    }

    // Check if user has access to this insight
    if (insight.userId !== userId && insight.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error('Error getting insight by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const markInsightAsRead = async (req: Request, res: Response) => {
  try {
    const insightId = req.params.id;
    const userId = req.currentUser?.id;

    if (!insightId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Insight ID and User ID are required'
      });
    }

    const insight = await Insight.findById(insightId);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: 'Insight not found'
      });
    }

    // Check if user has access to this insight
    if (insight.userId !== userId && insight.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    insight.readAt = new Date();
    await insight.save();

    res.status(200).json({
      success: true,
      data: insight,
      message: 'Insight marked as read'
    });
  } catch (error) {
    console.error('Error marking insight as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const markInsightAsApplied = async (req: Request, res: Response) => {
  try {
    const insightId = req.params.id;
    const userId = req.currentUser?.id;

    if (!insightId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Insight ID and User ID are required'
      });
    }

    const insight = await Insight.findById(insightId);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: 'Insight not found'
      });
    }

    // Check if user has access to this insight
    if (insight.userId !== userId && insight.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    insight.appliedAt = new Date();
    await insight.save();

    res.status(200).json({
      success: true,
      data: insight,
      message: 'Insight marked as applied'
    });
  } catch (error) {
    console.error('Error marking insight as applied:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const dismissInsight = async (req: Request, res: Response) => {
  try {
    const insightId = req.params.id;
    const userId = req.currentUser?.id;

    if (!insightId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Insight ID and User ID are required'
      });
    }

    const insight = await Insight.findById(insightId);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: 'Insight not found'
      });
    }

    // Check if user has access to this insight
    if (insight.userId !== userId && insight.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    insight.dismissedAt = new Date();
    await insight.save();

    res.status(200).json({
      success: true,
      data: insight,
      message: 'Insight dismissed'
    });
  } catch (error) {
    console.error('Error dismissing insight:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPriorityInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.query.partnerId as string;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    // Get high impact insights that are not dismissed
    const priorityInsights = await Insight.find({
      $or: [
        { userId, partnerId },
        { userId: partnerId, partnerId: userId }
      ],
      impact: 'high',
      dismissedAt: { $exists: false }
    }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: priorityInsights,
      count: priorityInsights.length
    });
  } catch (error) {
    console.error('Error getting priority insights:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getInsightsByCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.query.partnerId as string;
    const category = req.params.category;

    if (!userId || !partnerId || !category) {
      return res.status(400).json({
        success: false,
        message: 'User ID, Partner ID, and category are required'
      });
    }

    const insights = await Insight.find({
      $or: [
        { userId, partnerId },
        { userId: partnerId, partnerId: userId }
      ],
      category
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: insights,
      count: insights.length
    });
  } catch (error) {
    console.error('Error getting insights by category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

