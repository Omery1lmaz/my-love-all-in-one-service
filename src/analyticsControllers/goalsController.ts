import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { NotificationService } from '../services/notificationService';
import { Goal } from '../Models/goal';

const analyticsService = new AnalyticsService();
const notificationService = new NotificationService();

export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const {
      partnerId,
      title,
      description,
      category,
      targetValue,
      deadline,
      milestones
    } = req.body;

    if (!userId || !partnerId || !title || !description || !category || !targetValue || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const goalData = {
      userId,
      partnerId,
      title,
      description,
      category,
      targetValue,
      deadline: new Date(deadline),
      milestones: milestones || []
    };

    const goal = await analyticsService.createGoal(goalData);

    res.status(201).json({
      success: true,
      data: goal,
      message: 'Goal created successfully'
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id;
    const partnerId = req.query.partnerId as string;
    const status = req.query.status as string;

    if (!userId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Partner ID are required'
      });
    }

    const goals = await analyticsService.getGoals(userId, partnerId, status);

    res.status(200).json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getGoalById = async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id;
    const userId = req.currentUser?.id;

    if (!goalId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Goal ID and User ID are required'
      });
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if user has access to this goal
    if (goal.userId !== userId && goal.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error getting goal by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id;
    const userId = req.currentUser?.id;
    const updateData = req.body;

    if (!goalId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Goal ID and User ID are required'
      });
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if user has access to this goal
    if (goal.userId !== userId && goal.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update goal
    Object.assign(goal, updateData);
    goal.updatedAt = new Date();

    await goal.save();

    res.status(200).json({
      success: true,
      data: goal,
      message: 'Goal updated successfully'
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateGoalProgress = async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id;
    const userId = req.currentUser?.id;
    const { currentValue } = req.body;

    if (!goalId || !userId || currentValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Goal ID, User ID, and current value are required'
      });
    }

    const goal = await analyticsService.updateGoalProgress(goalId, currentValue);

    // Check if goal is completed and send notification
    if (goal.status === 'completed') {
      await notificationService.sendGoalAchievementNotification(userId, goal);
    }

    res.status(200).json({
      success: true,
      data: goal,
      message: 'Goal progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id;
    const userId = req.currentUser?.id;

    if (!goalId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Goal ID and User ID are required'
      });
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if user has access to this goal
    if (goal.userId !== userId && goal.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Goal.findByIdAndDelete(goalId);

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const completeMilestone = async (req: Request, res: Response) => {
  try {
    const goalId = req.params.id;
    const milestoneIndex = parseInt(req.params.milestoneIndex);
    const userId = req.currentUser?.id;

    if (!goalId || milestoneIndex === undefined || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Goal ID, milestone index, and User ID are required'
      });
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if user has access to this goal
    if (goal.userId !== userId && goal.partnerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if milestone index is valid
    if (milestoneIndex < 0 || milestoneIndex >= goal.milestones.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid milestone index'
      });
    }

    // Complete milestone
    goal.milestones[milestoneIndex].completed = true;
    goal.milestones[milestoneIndex].completedAt = new Date();

    await goal.save();

    res.status(200).json({
      success: true,
      data: goal,
      message: 'Milestone completed successfully'
    });
  } catch (error) {
    console.error('Error completing milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getGoalsByCategory = async (req: Request, res: Response) => {
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

    const goals = await Goal.find({
      $or: [
        { userId, partnerId },
        { userId: partnerId, partnerId: userId }
      ],
      category
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: goals,
      count: goals.length
    });
  } catch (error) {
    console.error('Error getting goals by category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

