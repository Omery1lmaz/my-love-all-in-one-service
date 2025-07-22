import { Request, Response } from "express";
import { Event } from "../Models/event";
import jwt from "jsonwebtoken";

const getUpcomingEventsController = async (req: Request, res: Response) => {
  console.log("getUpcomingEventsController");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("authHeader not found");
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }

  const token = authHeader.split(" ")[1];
  console.log(token, "token")
  if (!token) {
    console.log("token not found");
    res.status(400).json({ message: "Token bulunamadı" });
    return;
  }

  try {
    console.log(process.env.SECRET_KEY, "process env secret key")
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };

    // Query parameters
    const days = parseInt(req.query.days as string) || 1200; // Varsayılan 30 gün
    const limit = parseInt(req.query.limit as string) || 10; // Varsayılan 10 event

    const now = new Date(-1);
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    // Kullanıcının eventlerini al
    const userEvents = await Event.find({
      $or: [{ userId: decodedToken.id }, { partnerId: decodedToken.id }],
    })
      .populate("photos")
      .populate("coverPhotoId");

    const upcomingEvents: any[] = [];

    for (const event of userEvents) {
      // Tekrarlı olmayan eventler için basit kontrol
      if (!event.isRecurring) {
        if (event.startDate >= now && event.startDate <= futureDate) {
          upcomingEvents.push({
            ...event.toObject(),
            nextOccurrence: event.startDate,
            isRecurring: false
          });
        }
      } else {
        // Tekrarlı eventler için gelecek oluşumları hesapla
        const nextOccurrences = calculateNextOccurrences(
          event.startDate,
          event.recurrence!,
          now,
          futureDate
        );

        for (const occurrence of nextOccurrences) {
          upcomingEvents.push({
            ...event.toObject(),
            nextOccurrence: occurrence,
            isRecurring: true,
            originalStartDate: event.startDate
          });
        }
      }
    }

    // Tarihe göre sırala ve limit uygula
    upcomingEvents.sort((a, b) => a.nextOccurrence - b.nextOccurrence);
    const limitedEvents = upcomingEvents.slice(0, limit);

    res.status(200).json({
      message: "Yaklaşan eventler başarıyla alındı",
      status: "success",
      statusCode: 200,
      data: limitedEvents,
      total: upcomingEvents.length,
      days: days
    });

  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Yaklaşan eventler alınamadı" });
  }
};

// Tekrarlı eventler için gelecek oluşumları hesaplayan yardımcı fonksiyon
function calculateNextOccurrences(
  startDate: Date,
  recurrence: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval?: number;
    endDate?: Date;
  },
  fromDate: Date,
  toDate: Date
): Date[] {
  const occurrences: Date[] = [];
  const interval = recurrence.interval || 1;
  let currentDate = new Date(startDate);

  // Eğer başlangıç tarihi geçmişte ise, gelecek oluşumları hesapla
  while (currentDate < fromDate) {
    switch (recurrence.frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + (7 * interval));
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        break;
    }
  }

  // Gelecek oluşumları topla
  while (currentDate <= toDate) {
    if (!recurrence.endDate || currentDate <= recurrence.endDate) {
      occurrences.push(new Date(currentDate));
    }

    switch (recurrence.frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + (7 * interval));
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        break;
    }
  }

  return occurrences;
}

export default getUpcomingEventsController; 