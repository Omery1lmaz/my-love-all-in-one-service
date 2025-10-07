import { Request, Response, NextFunction } from "express";
import { AIChatSession } from "../Models/aiChat";
import {
  chatWithAI,
  chatWithLifeCoach,
  chatWithGoogleAI,
  chatWithGoogleLifeCoach,
  chatWithGoogleAIStream,
  chatWithGoogleLifeCoachStream,
} from "../utils/aiClient";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import { Subscription } from "../Models/subscription";
import mongoose from "mongoose";

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  console.log(
    `[${new Date().toISOString()}] [${requestId}] AI Chat sendMessage started`,
    {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      body: {
        sessionId: req.body?.sessionId,
        messageLength: req.body?.message?.length,
      },
    }
  );

  const authHeader = req.headers.authorization;
  const { sessionId, message } = req.body;

  if (!authHeader) {
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Authentication failed: no authHeader`
    );
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Authentication failed: no token`
    );
    res.status(400).json({ message: "Token bulunamadı" });
    return;
  }

  try {
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Verifying JWT token`
    );
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };
    console.log(
      `[${new Date().toISOString()}] [${requestId}] JWT token verified successfully`,
      {
        userId: decodedToken.id,
      }
    );

    console.log(
      `[${new Date().toISOString()}] [${requestId}] Fetching user from database`
    );
    const user = await User.findById(
      new mongoose.Types.ObjectId(decodedToken.id)
    );

    if (!user) {
      console.log(
        `[${new Date().toISOString()}] [${requestId}] User not found in database`,
        {
          userId: decodedToken.id,
        }
      );
      res.status(401).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    console.log(
      `[${new Date().toISOString()}] [${requestId}] User found successfully`,
      {
        userId: user._id,
        email: user.email,
      }
    );

    // Ensure user has a subscription (create default if not exists)
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Ensuring subscription exists for AI chat`,
      {
        userId: decodedToken.id,
      }
    );
    let userSubscription;
    try {
      console.log(
        `[${new Date().toISOString()}] [${requestId}] Getting/creating default subscription`
      );
      userSubscription = await Subscription.getDefaultSubscription(
        new mongoose.Types.ObjectId(decodedToken.id)
      );
      console.log(
        `[${new Date().toISOString()}] [${requestId}] Subscription verified/created for AI chat`,
        {
          userId: decodedToken.id,
          subscriptionId: userSubscription._id,
          planType: userSubscription.planType,
          isActive: userSubscription.isActive,
        }
      );

      // Double check that subscription is active
      if (!userSubscription.isActive) {
        console.warn(
          `[${new Date().toISOString()}] [${requestId}] Subscription found but inactive, activating...`,
          {
            userId: decodedToken.id,
            subscriptionId: userSubscription._id,
          }
        );
        userSubscription.isActive = true;
        await userSubscription.save();
        console.log(
          `[${new Date().toISOString()}] [${requestId}] Subscription activated successfully`,
          {
            userId: decodedToken.id,
            subscriptionId: userSubscription._id,
          }
        );
      }
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] [${requestId}] Error with subscription for AI chat`,
        {
          userId: decodedToken.id,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      res.status(400).json({ message: "Subscription doğrulanamadı" });
      return;
    }

    // Check if user can send more AI messages (basic check)
    const existingAIMessages = await AIChatSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(decodedToken.id) } },
      { $unwind: "$messages" },
      { $match: { "messages.role": "user" } },
      { $count: "totalMessages" },
    ]);

    const messageCount =
      existingAIMessages.length > 0 ? existingAIMessages[0].totalMessages : 0;
    // Basic AI message limit check (can be enhanced based on plan)
    const maxAIMessages =
      userSubscription.planType === "free"
        ? 20
        : userSubscription.planType === "premium"
        ? 100
        : 500;

    if (messageCount >= maxAIMessages) {
      console.error(
        `[${new Date().toISOString()}] [${requestId}] AI message limit exceeded`,
        {
          userId: decodedToken.id,
          messageCount,
          maxAIMessages,
          planType: userSubscription.planType,
        }
      );
      res.status(400).json({
        message: `AI sohbet limiti aşıldı. Mevcut planınızla ${maxAIMessages} AI mesajı gönderebilirsiniz.`,
      });
      return;
    }

    if (!sessionId || !message) {
      res.status(400).json({ message: "Session ID ve mesaj gereklidir" });
      return;
    }

    // Session'ı bul

    const session = await AIChatSession.findOne({
      sessionId,
      userId: user._id,
      isActive: true,
    });

    if (!session) {
      res.status(404).json({ message: "Chat session bulunamadı" });
      return;
    }

    // Kullanıcı mesajını ekle
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Adding user message to session`
    );
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // AI yanıtını al
    let aiResponse = "";
    try {
      // Konuşma geçmişini hazırla (son 10 mesaj)
      const conversationHistory = session.messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log(
        `[${new Date().toISOString()}] [${requestId}] Preparing AI request`,
        {
          coachType: session.coachType,
          coachId: session.coachId,
          conversationHistoryLength: conversationHistory.length,
          messageLength: message.length,
        }
      );

      // Koç türüne göre farklı AI fonksiyonlarını kullan
      if (
        session.coachType &&
        session.coachType !== "general" &&
        session.coachId
      ) {
        // Yaşam koçu ile sohbet - Google AI kullan
        console.log(
          `[${new Date().toISOString()}] [${requestId}] Using life coach AI`,
          {
            coachId: session.coachId,
            coachType: session.coachType,
          }
        );
        const aiResult = await chatWithGoogleLifeCoach({
          message,
          coachId: session.coachId,
          conversationHistory,
        });
        aiResponse = aiResult.response;
        console.log(
          `[${new Date().toISOString()}] [${requestId}] Life coach AI response received`,
          {
            responseLength: aiResponse.length,
            response: aiResult.response,
          }
        );
      } else {
        // Genel AI sohbet - Google AI kullan
        console.log(
          `[${new Date().toISOString()}] [${requestId}] Using general AI`
        );
        const aiResult = await chatWithGoogleAI({
          message,
          conversationHistory,
        });
        aiResponse = aiResult.response;
        console.log(
          `[${new Date().toISOString()}] [${requestId}] General AI response received`,
          {
            responseLength: aiResponse.length,
          }
        );
      }
    } catch (aiError) {
      console.error(
        `[${new Date().toISOString()}] [${requestId}] AI response error`,
        {
          error: aiError instanceof Error ? aiError.message : aiError,
          stack: aiError instanceof Error ? aiError.stack : undefined,
          coachType: session.coachType,
          coachId: session.coachId,
        }
      );
      aiResponse =
        "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
    }

    // AI yanıtını ekle
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Adding AI response to session`
    );
    session.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    // Session'ı güncelle
    session.updatedAt = new Date();
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Saving AI chat session to database`
    );
    await session.save();

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(
      `[${new Date().toISOString()}] [${requestId}] AI message sent successfully`,
      {
        userId: decodedToken.id,
        sessionId: session.sessionId,
        messageCount: session.messages.length,
        planType: userSubscription.planType,
        remainingAIMessages: maxAIMessages - (messageCount + 1),
        processingTimeMs: processingTime,
        aiResponseLength: aiResponse.length,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        message: {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        },
        messageCount: session.messages.length,
        coachType: session.coachType,
        coachId: session.coachId,
      },
      subscriptionInfo: {
        planType: userSubscription.planType,
        remainingAIMessages: maxAIMessages - (messageCount + 1),
        maxAIMessages: maxAIMessages,
      },
    });
  } catch (error) {
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.error(
      `[${new Date().toISOString()}] [${requestId}] Error in sendMessage`,
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        processingTimeMs: processingTime,
        requestBody: {
          sessionId: req.body?.sessionId,
          messageLength: req.body?.message?.length,
        },
      }
    );
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};

export const sendMessageStream = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  console.log(
    `[${new Date().toISOString()}] [${requestId}] AI Chat sendMessageStream started`,
    {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      body: {
        sessionId: req.body?.sessionId,
        messageLength: req.body?.message?.length,
      },
    }
  );

  const authHeader = req.headers.authorization;
  const { sessionId, message } = req.body;

  if (!authHeader) {
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Authentication failed: no authHeader`
    );
    res.status(401).json({ message: "Lütfen giriş yapın" });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Authentication failed: no token`
    );
    res.status(400).json({ message: "Token bulunamadı" });
    return;
  }

  try {
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Verifying JWT token for streaming`
    );
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
    };
    console.log(
      `[${new Date().toISOString()}] [${requestId}] JWT token verified successfully for streaming`,
      {
        userId: decodedToken.id,
      }
    );

    console.log(
      `[${new Date().toISOString()}] [${requestId}] Fetching user from database for streaming`
    );
    const user = await User.findById(
      new mongoose.Types.ObjectId(decodedToken.id)
    );

    if (!user) {
      console.log(
        `[${new Date().toISOString()}] [${requestId}] User not found in database for streaming`,
        {
          userId: decodedToken.id,
        }
      );
      res.status(401).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    console.log(
      `[${new Date().toISOString()}] [${requestId}] User found successfully for streaming`,
      {
        userId: user._id,
        email: user.email,
      }
    );

    // Ensure user has a subscription (create default if not exists)
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Ensuring subscription exists for AI chat streaming`,
      {
        userId: decodedToken.id,
      }
    );
    let userSubscription;
    try {
      console.log(
        `[${new Date().toISOString()}] [${requestId}] Getting/creating default subscription for streaming`
      );
      userSubscription = await Subscription.getDefaultSubscription(
        new mongoose.Types.ObjectId(decodedToken.id)
      );
      console.log(
        `[${new Date().toISOString()}] [${requestId}] Subscription verified/created for AI chat streaming`,
        {
          userId: decodedToken.id,
          subscriptionId: userSubscription._id,
          planType: userSubscription.planType,
          isActive: userSubscription.isActive,
        }
      );

      // Double check that subscription is active
      if (!userSubscription.isActive) {
        console.warn(
          `[${new Date().toISOString()}] [${requestId}] Subscription found but inactive for streaming, activating...`,
          {
            userId: decodedToken.id,
            subscriptionId: userSubscription._id,
          }
        );
        userSubscription.isActive = true;
        await userSubscription.save();
        console.log(
          `[${new Date().toISOString()}] [${requestId}] Subscription activated successfully for streaming`,
          {
            userId: decodedToken.id,
            subscriptionId: userSubscription._id,
          }
        );
      }
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] [${requestId}] Error with subscription for AI chat streaming`,
        {
          userId: decodedToken.id,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      res.status(400).json({ message: "Subscription doğrulanamadı" });
      return;
    }

    // Check if user can send more AI messages (basic check)
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Checking AI message count for streaming`
    );
    const existingAIMessages = await AIChatSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(decodedToken.id) } },
      { $unwind: "$messages" },
      { $match: { "messages.role": "user" } },
      { $count: "totalMessages" },
    ]);

    const messageCount =
      existingAIMessages.length > 0 ? existingAIMessages[0].totalMessages : 0;
    console.log(
      `[${new Date().toISOString()}] [${requestId}] AI message count check completed for streaming`,
      {
        userId: decodedToken.id,
        messageCount,
        planType: userSubscription.planType,
      }
    );

    // Basic AI message limit check (can be enhanced based on plan)
    const maxAIMessages =
      userSubscription.planType === "free"
        ? 20
        : userSubscription.planType === "premium"
        ? 100
        : 500;

    if (messageCount >= maxAIMessages) {
      console.error(
        `[${new Date().toISOString()}] [${requestId}] AI message limit exceeded for streaming`,
        {
          userId: decodedToken.id,
          messageCount,
          maxAIMessages,
          planType: userSubscription.planType,
        }
      );
      res.status(400).json({
        message: `AI sohbet limiti aşıldı. Mevcut planınızla ${maxAIMessages} AI mesajı gönderebilirsiniz.`,
      });
      return;
    }

    console.log(
      `[${new Date().toISOString()}] [${requestId}] AI message streaming allowed`,
      {
        userId: decodedToken.id,
        messageCount,
        maxAIMessages,
        planType: userSubscription.planType,
      }
    );

    console.log(
      `[${new Date().toISOString()}] [${requestId}] Validating request parameters for streaming`,
      {
        sessionId,
        messageLength: message?.length,
      }
    );
    if (!sessionId || !message) {
      console.log(
        `[${new Date().toISOString()}] [${requestId}] Request validation failed for streaming: missing sessionId or message`
      );
      res.status(400).json({ message: "Session ID ve mesaj gereklidir" });
      return;
    }

    // Session'ı bul
    console.log(
      `[${new Date().toISOString()}] [${requestId}] Finding chat session for streaming`,
      {
        sessionId,
        userId: user._id,
      }
    );
    const session = await AIChatSession.findOne({
      sessionId,
      userId: user._id,
      isActive: true,
    });

    if (!session) {
      res.status(404).json({ message: "Chat session bulunamadı" });
      return;
    }

    // Kullanıcı mesajını ekle
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Streaming response için headers ayarla
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullResponse = "";
    let chunkCount = 0;

    try {
      // Konuşma geçmişini hazırla (son 10 mesaj)
      const conversationHistory = session.messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Koç türüne göre farklı AI fonksiyonlarını kullan
      if (
        session.coachType &&
        session.coachType !== "general" &&
        session.coachId
      ) {
        // Yaşam koçu ile streaming sohbet
        for await (const chunk of chatWithGoogleLifeCoachStream({
          message,
          coachId: session.coachId,
          conversationHistory,
        })) {
          fullResponse += chunk;
          res.write(chunk);
          chunkCount++;
        }
      } else {
        // Genel AI streaming sohbet
        for await (const chunk of chatWithGoogleAIStream({
          message,
          conversationHistory,
        })) {
          fullResponse += chunk;
          res.write(chunk);
          chunkCount++;
        }
      }
    } catch (aiError) {
      console.error(
        `[${new Date().toISOString()}] [${requestId}] AI streaming response error`,
        {
          error: aiError instanceof Error ? aiError.message : aiError,
          stack: aiError instanceof Error ? aiError.stack : undefined,
          coachType: session.coachType,
          coachId: session.coachId,
          chunkCount,
        }
      );
      const errorMessage =
        "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
      fullResponse = errorMessage;
      res.write(errorMessage);
    }

    // AI yanıtını session'a ekle

    session.messages.push({
      role: "assistant",
      content: fullResponse,
      timestamp: new Date(),
    });

    // Session'ı güncelle
    session.updatedAt = new Date();
    await session.save();

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    res.end();
  } catch (error) {
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.error(
      `[${new Date().toISOString()}] [${requestId}] Error in sendMessageStream`,
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        processingTimeMs: processingTime,
        requestBody: {
          sessionId: req.body?.sessionId,
          messageLength: req.body?.message?.length,
        },
      }
    );
    res.status(400).json({ message: "Kimlik doğrulama başarısız" });
  }
};
