import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AIService } from '../services/aiService';
import { NotificationService } from '../services/notificationService';
import { Report } from '../Models/report';

const analyticsService = new AnalyticsService();
const aiService = new AIService();
const notificationService = new NotificationService();

export const generateWeeklyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.body.partnerId;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    const report = await analyticsService.generateWeeklyReport(userId, partnerId);

    // Send notification
    await notificationService.sendWeeklyReportNotification(userId, report);

    res.status(200).json({
      success: true,
      data: report,
      message: 'Weekly report generated successfully'
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const generateMonthlyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.body.partnerId;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Generate monthly report (similar to weekly but for a month)
    const report = await analyticsService.generateWeeklyReport(userId, partnerId); // Reuse logic for now

    // Update report type to monthly
    report.type = 'monthly';
    report.periodStart = monthAgo;
    await report.save();

    // Send notification
    await notificationService.sendMonthlyReportNotification(userId, report);

    res.status(200).json({
      success: true,
      data: report,
      message: 'Monthly report generated successfully'
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getWeeklyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.query.partnerId as string;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    const report = await Report.findOne({
      $or: [
        { userId, partnerId },
        { userId: partnerId, partnerId: userId }
      ],
      type: 'weekly'
    }).sort({ generatedAt: -1 });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No weekly report found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error getting weekly report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.query.partnerId as string;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    const report = await Report.findOne({
      $or: [
        { userId, partnerId },
        { userId: partnerId, partnerId: userId }
      ],
      type: 'monthly'
    }).sort({ generatedAt: -1 });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No monthly report found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error getting monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id;
    const userId = req.currentUser?.id;

    if (!reportId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID and User ID are required'
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has access to this report
    if (report.userId !== userId && report.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error getting report by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getReportHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.query.partnerId as string;
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    const query: any = {
      $or: [
        { userId, partnerId },
        { userId: partnerId, partnerId: userId }
      ]
    };

    if (type) {
      query.type = type;
    }

    const reports = await Report.find(query)
      .sort({ generatedAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Error getting report history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const generateReportSummary = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id;
    const userId = req.currentUser?.id;

    if (!reportId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID and User ID are required'
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has access to this report
    if (report.userId !== userId && report.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate AI summary
    const summary = await aiService.generateReportSummary(report);

    res.status(200).json({
      success: true,
      data: {
        reportId: report._id,
        summary
      }
    });
  } catch (error) {
    console.error('Error generating report summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const shareReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id;
    const userId = req.currentUser?.id;
    const { shareWith } = req.body;

    if (!reportId || !userId || !shareWith) {
      return res.status(400).json({
        success: false,
        message: 'Report ID, User ID, and share target are required'
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has access to this report
    if (report.userId !== userId && report.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Here you would implement the sharing logic
    // For now, we'll just return a success message
    res.status(200).json({
      success: true,
      message: 'Report shared successfully',
      data: {
        reportId: report._id,
        sharedWith: shareWith
      }
    });
  } catch (error) {
    console.error('Error sharing report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id;
    const userId = req.currentUser?.id;

    if (!reportId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID and User ID are required'
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has access to this report
    if (report.userId !== userId && report.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Report.findByIdAndDelete(reportId);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

