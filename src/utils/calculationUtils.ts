export class CalculationUtils {
  /**
   * Calculate overall health score from individual category scores
   */
  static calculateOverallScore(scores: {
    communication: number;
    intimacy: number;
    trust: number;
    satisfaction: number;
    conflictResolution: number;
  }): number {
    const weights = {
      communication: 0.25,
      intimacy: 0.20,
      trust: 0.20,
      satisfaction: 0.20,
      conflictResolution: 0.15
    };

    let totalScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      totalScore += scores[key as keyof typeof scores] * weight;
    }

    return Math.round(totalScore);
  }

  /**
   * Calculate communication score based on message frequency, sentiment, and response time
   */
  static calculateCommunicationScore(data: {
    messageCount: number;
    positiveSentiment: number;
    averageResponseTime: number;
    days: number;
  }): number {
    const { messageCount, positiveSentiment, averageResponseTime, days } = data;

    // Frequency score (0-100): Target 10 messages per day
    const targetDailyMessages = 10;
    const dailyMessageCount = messageCount / days;
    const frequencyScore = Math.min(100, (dailyMessageCount / targetDailyMessages) * 100);

    // Sentiment score (0-100)
    const sentimentScore = positiveSentiment;

    // Response time score (0-100): < 1 hour = 100, > 24 hours = 0
    let responseTimeScore = 100;
    if (averageResponseTime > 60) { // More than 1 hour
      responseTimeScore = Math.max(0, 100 - ((averageResponseTime - 60) / 1380) * 100);
    }

    return Math.round((frequencyScore + sentimentScore + responseTimeScore) / 3);
  }

  /**
   * Calculate intimacy score based on shared activities and content
   */
  static calculateIntimacyScore(data: {
    sharedEvents: number;
    sharedPhotos: number;
    sharedContent: number;
    days: number;
  }): number {
    const { sharedEvents, sharedPhotos, sharedContent, days } = data;

    // Event score (0-100): Target 2 events per week
    const targetWeeklyEvents = 2;
    const weeklyEventCount = (sharedEvents / days) * 7;
    const eventScore = Math.min(100, (weeklyEventCount / targetWeeklyEvents) * 100);

    // Photo score (0-100): Target 5 photos per week
    const targetWeeklyPhotos = 5;
    const weeklyPhotoCount = (sharedPhotos / days) * 7;
    const photoScore = Math.min(100, (weeklyPhotoCount / targetWeeklyPhotos) * 100);

    // Content score (0-100): Target 3 shared content per week
    const targetWeeklyContent = 3;
    const weeklyContentCount = (sharedContent / days) * 7;
    const contentScore = Math.min(100, (weeklyContentCount / targetWeeklyContent) * 100);

    return Math.round((eventScore + photoScore + contentScore) / 3);
  }

  /**
   * Calculate trust score based on consistency and reliability
   */
  static calculateTrustScore(data: {
    messageConsistency: number;
    eventConsistency: number;
    responseReliability: number;
    transparencyScore: number;
  }): number {
    const { messageConsistency, eventConsistency, responseReliability, transparencyScore } = data;

    return Math.round((messageConsistency + eventConsistency + responseReliability + transparencyScore) / 4);
  }

  /**
   * Calculate satisfaction score based on mood and feedback
   */
  static calculateSatisfactionScore(data: {
    averageMood: number;
    moodConsistency: number;
    positiveFeedback: number;
    engagementLevel: number;
  }): number {
    const { averageMood, moodConsistency, positiveFeedback, engagementLevel } = data;

    // Convert mood from 1-10 scale to 0-100
    const moodScore = (averageMood / 10) * 100;

    return Math.round((moodScore + moodConsistency + positiveFeedback + engagementLevel) / 4);
  }

  /**
   * Calculate conflict resolution score
   */
  static calculateConflictResolutionScore(data: {
    conflictCount: number;
    resolutionTime: number;
    resolutionSuccess: number;
    escalationRate: number;
    totalInteractions: number;
  }): number {
    const { conflictCount, resolutionTime, resolutionSuccess, escalationRate, totalInteractions } = data;

    // Conflict frequency score (lower is better)
    const conflictRate = conflictCount / totalInteractions;
    const frequencyScore = Math.max(0, 100 - (conflictRate * 200));

    // Resolution time score (faster is better)
    const timeScore = Math.max(0, 100 - (resolutionTime / 24) * 100); // 24 hours = 0 score

    // Resolution success score
    const successScore = resolutionSuccess;

    // Escalation rate score (lower is better)
    const escalationScore = Math.max(0, 100 - (escalationRate * 100));

    return Math.round((frequencyScore + timeScore + successScore + escalationScore) / 4);
  }

  /**
   * Calculate trend direction and percentage change
   */
  static calculateTrend(values: number[]): { direction: 'increasing' | 'decreasing' | 'stable'; percentage: number } {
    if (values.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }

    const first = values[0];
    const last = values[values.length - 1];
    const percentage = ((last - first) / first) * 100;

    if (percentage > 5) {
      return { direction: 'increasing', percentage: Math.round(percentage) };
    } else if (percentage < -5) {
      return { direction: 'decreasing', percentage: Math.round(Math.abs(percentage)) };
    } else {
      return { direction: 'stable', percentage: 0 };
    }
  }

  /**
   * Calculate moving average for smoothing trends
   */
  static calculateMovingAverage(values: number[], windowSize: number = 7): number[] {
    if (values.length < windowSize) {
      return values;
    }

    const result: number[] = [];
    for (let i = windowSize - 1; i < values.length; i++) {
      const window = values.slice(i - windowSize + 1, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
      result.push(Math.round(average));
    }

    return result;
  }

  /**
   * Detect anomalies in data series
   */
  static detectAnomalies(values: number[], threshold: number = 2): number[] {
    if (values.length < 3) {
      return [];
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    const anomalies: number[] = [];
    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / standardDeviation);
      if (zScore > threshold) {
        anomalies.push(index);
      }
    });

    return anomalies;
  }

  /**
   * Calculate correlation coefficient between two data series
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) {
      return 0;
    }

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, index) => sum + val * y[index], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate goal progress percentage
   */
  static calculateGoalProgress(currentValue: number, targetValue: number): number {
    if (targetValue === 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
  }

  /**
   * Calculate weighted score from multiple factors
   */
  static calculateWeightedScore(factors: { value: number; weight: number }[]): number {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    if (totalWeight === 0) {
      return 0;
    }

    const weightedSum = factors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0);
    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Normalize score to 0-100 range
   */
  static normalizeScore(value: number, min: number, max: number): number {
    if (max === min) {
      return 50; // Return middle value if no range
    }
    return Math.round(((value - min) / (max - min)) * 100);
  }

  /**
   * Calculate percentile rank
   */
  static calculatePercentile(value: number, values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    const sortedValues = [...values].sort((a, b) => a - b);
    const rank = sortedValues.findIndex(v => v >= value);
    
    if (rank === -1) {
      return 100; // Value is higher than all others
    }

    return Math.round((rank / sortedValues.length) * 100);
  }
}

