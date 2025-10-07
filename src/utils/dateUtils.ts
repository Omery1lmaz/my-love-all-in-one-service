export class DateUtils {
  /**
   * Get start of day
   */
  static getStartOfDay(date: Date = new Date()): Date {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  /**
   * Get end of day
   */
  static getEndOfDay(date: Date = new Date()): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  /**
   * Get start of week (Monday)
   */
  static getStartOfWeek(date: Date = new Date()): Date {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    return this.getStartOfDay(startOfWeek);
  }

  /**
   * Get end of week (Sunday)
   */
  static getEndOfWeek(date: Date = new Date()): Date {
    const endOfWeek = new Date(date);
    const day = endOfWeek.getDay();
    const diff = endOfWeek.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
    endOfWeek.setDate(diff);
    return this.getEndOfDay(endOfWeek);
  }

  /**
   * Get start of month
   */
  static getStartOfMonth(date: Date = new Date()): Date {
    const startOfMonth = new Date(date);
    startOfMonth.setDate(1);
    return this.getStartOfDay(startOfMonth);
  }

  /**
   * Get end of month
   */
  static getEndOfMonth(date: Date = new Date()): Date {
    const endOfMonth = new Date(date);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    return this.getEndOfDay(endOfMonth);
  }

  /**
   * Get start of quarter
   */
  static getStartOfQuarter(date: Date = new Date()): Date {
    const startOfQuarter = new Date(date);
    const quarter = Math.floor(startOfQuarter.getMonth() / 3);
    startOfQuarter.setMonth(quarter * 3, 1);
    return this.getStartOfDay(startOfQuarter);
  }

  /**
   * Get end of quarter
   */
  static getEndOfQuarter(date: Date = new Date()): Date {
    const endOfQuarter = new Date(date);
    const quarter = Math.floor(endOfQuarter.getMonth() / 3);
    endOfQuarter.setMonth(quarter * 3 + 3, 0);
    return this.getEndOfDay(endOfQuarter);
  }

  /**
   * Get start of year
   */
  static getStartOfYear(date: Date = new Date()): Date {
    const startOfYear = new Date(date);
    startOfYear.setMonth(0, 1);
    return this.getStartOfDay(startOfYear);
  }

  /**
   * Get end of year
   */
  static getEndOfYear(date: Date = new Date()): Date {
    const endOfYear = new Date(date);
    endOfYear.setMonth(11, 31);
    return this.getEndOfDay(endOfYear);
  }

  /**
   * Get date N days ago
   */
  static getDaysAgo(days: number, date: Date = new Date()): Date {
    const pastDate = new Date(date);
    pastDate.setDate(pastDate.getDate() - days);
    return pastDate;
  }

  /**
   * Get date N weeks ago
   */
  static getWeeksAgo(weeks: number, date: Date = new Date()): Date {
    const pastDate = new Date(date);
    pastDate.setDate(pastDate.getDate() - (weeks * 7));
    return pastDate;
  }

  /**
   * Get date N months ago
   */
  static getMonthsAgo(months: number, date: Date = new Date()): Date {
    const pastDate = new Date(date);
    pastDate.setMonth(pastDate.getMonth() - months);
    return pastDate;
  }

  /**
   * Get date N years ago
   */
  static getYearsAgo(years: number, date: Date = new Date()): Date {
    const pastDate = new Date(date);
    pastDate.setFullYear(pastDate.getFullYear() - years);
    return pastDate;
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  /**
   * Check if date is yesterday
   */
  static isYesterday(date: Date): boolean {
    const yesterday = this.getDaysAgo(1);
    return this.isSameDay(date, yesterday);
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Check if date is in current week
   */
  static isInCurrentWeek(date: Date): boolean {
    const startOfWeek = this.getStartOfWeek();
    const endOfWeek = this.getEndOfWeek();
    return date >= startOfWeek && date <= endOfWeek;
  }

  /**
   * Check if date is in current month
   */
  static isInCurrentMonth(date: Date): boolean {
    const startOfMonth = this.getStartOfMonth();
    const endOfMonth = this.getEndOfMonth();
    return date >= startOfMonth && date <= endOfMonth;
  }

  /**
   * Check if date is in current year
   */
  static isInCurrentYear(date: Date): boolean {
    const currentYear = new Date().getFullYear();
    return date.getFullYear() === currentYear;
  }

  /**
   * Get days between two dates
   */
  static getDaysBetween(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Get hours between two dates
   */
  static getHoursBetween(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600));
  }

  /**
   * Get minutes between two dates
   */
  static getMinutesBetween(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 60));
  }

  /**
   * Format date to Turkish locale
   */
  static formatToTurkish(date: Date): string {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format date to short Turkish format
   */
  static formatToTurkishShort(date: Date): string {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date to time string
   */
  static formatToTime(date: Date): string {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format date to datetime string
   */
  static formatToDateTime(date: Date): string {
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "3 days ago")
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Az önce';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} dakika önce`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} saat önce`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} gün önce`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ay önce`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} yıl önce`;
    }
  }

  /**
   * Get week number of year
   */
  static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Get quarter number
   */
  static getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
  }

  /**
   * Check if year is leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Get number of days in month
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Add business days (excluding weekends)
   */
  static addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) { // Not Sunday (0) or Saturday (6)
        addedDays++;
      }
    }

    return result;
  }

  /**
   * Get business days between two dates
   */
  static getBusinessDaysBetween(date1: Date, date2: Date): number {
    let count = 0;
    const current = new Date(date1);

    while (current <= date2) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}

