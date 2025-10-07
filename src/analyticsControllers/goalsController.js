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
exports.getGoalsByCategory = exports.completeMilestone = exports.deleteGoal = exports.updateGoalProgress = exports.updateGoal = exports.getGoalById = exports.getGoals = exports.createGoal = void 0;
const analyticsService_1 = require("../services/analyticsService");
const notificationService_1 = require("../services/notificationService");
const goal_1 = require("../Models/goal");
const analyticsService = new analyticsService_1.AnalyticsService();
const notificationService = new notificationService_1.NotificationService();
const createGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
        const { partnerId, title, description, category, targetValue, deadline, milestones } = req.body;
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
        const goal = yield analyticsService.createGoal(goalData);
        res.status(201).json({
            success: true,
            data: goal,
            message: 'Goal created successfully'
        });
    }
    catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.createGoal = createGoal;
const getGoals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
        const partnerId = req.query.partnerId;
        const status = req.query.status;
        if (!userId || !partnerId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Partner ID are required'
            });
        }
        const goals = yield analyticsService.getGoals(userId, partnerId, status);
        res.status(200).json({
            success: true,
            data: goals,
            count: goals.length
        });
    }
    catch (error) {
        console.error('Error getting goals:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.getGoals = getGoals;
const getGoalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const goalId = req.params.id;
        const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
        if (!goalId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Goal ID and User ID are required'
            });
        }
        const goal = yield goal_1.Goal.findById(goalId);
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
    }
    catch (error) {
        console.error('Error getting goal by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.getGoalById = getGoalById;
const updateGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const goalId = req.params.id;
        const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
        const updateData = req.body;
        if (!goalId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Goal ID and User ID are required'
            });
        }
        const goal = yield goal_1.Goal.findById(goalId);
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
        yield goal.save();
        res.status(200).json({
            success: true,
            data: goal,
            message: 'Goal updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.updateGoal = updateGoal;
const updateGoalProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const goalId = req.params.id;
        const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
        const { currentValue } = req.body;
        if (!goalId || !userId || currentValue === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Goal ID, User ID, and current value are required'
            });
        }
        const goal = yield analyticsService.updateGoalProgress(goalId, currentValue);
        // Check if goal is completed and send notification
        if (goal.status === 'completed') {
            yield notificationService.sendGoalAchievementNotification(userId, goal);
        }
        res.status(200).json({
            success: true,
            data: goal,
            message: 'Goal progress updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating goal progress:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.updateGoalProgress = updateGoalProgress;
const deleteGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const goalId = req.params.id;
        const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
        if (!goalId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Goal ID and User ID are required'
            });
        }
        const goal = yield goal_1.Goal.findById(goalId);
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
        yield goal_1.Goal.findByIdAndDelete(goalId);
        res.status(200).json({
            success: true,
            message: 'Goal deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.deleteGoal = deleteGoal;
const completeMilestone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const goalId = req.params.id;
        const milestoneIndex = parseInt(req.params.milestoneIndex);
        const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
        if (!goalId || milestoneIndex === undefined || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Goal ID, milestone index, and User ID are required'
            });
        }
        const goal = yield goal_1.Goal.findById(goalId);
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
        yield goal.save();
        res.status(200).json({
            success: true,
            data: goal,
            message: 'Milestone completed successfully'
        });
    }
    catch (error) {
        console.error('Error completing milestone:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.completeMilestone = completeMilestone;
const getGoalsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id;
        const partnerId = req.query.partnerId;
        const category = req.params.category;
        if (!userId || !partnerId || !category) {
            return res.status(400).json({
                success: false,
                message: 'User ID, Partner ID, and category are required'
            });
        }
        const goals = yield goal_1.Goal.find({
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
    }
    catch (error) {
        console.error('Error getting goals by category:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.getGoalsByCategory = getGoalsByCategory;
