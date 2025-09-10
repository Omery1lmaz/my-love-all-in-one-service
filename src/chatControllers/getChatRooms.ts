import { Request, Response } from "express";
import { ChatRoom } from "../Models/chat";
import { User } from "../Models/user";

export const getChatRooms = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser!.id;

    // Get user's chat rooms
    const chatRooms = await ChatRoom.find({
      $or: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    })
    .populate([
      { path: 'user1Id', select: 'name profilePhoto nickname partnerNickname' },
      { path: 'user2Id', select: 'name profilePhoto nickname partnerNickname' },
      { 
        path: 'lastMessage', 
        select: 'content messageType createdAt senderId',
        populate: { path: 'senderId', select: 'name' }
      }
    ])
    .sort({ lastMessageTime: -1, createdAt: -1 });

    // Format response to show partner info and unread count
    const formattedChatRooms = chatRooms.map(room => {
      const isUser1 = room.user1Id.toString() === userId;
      const partner = isUser1 ? room.user2Id : room.user1Id;
      const unreadCount = isUser1 ? room.unreadCountUser1 : room.unreadCountUser2;

      return {
        _id: room._id,
        partner: {
          _id: partner._id,
          name: partner.name,
          profilePhoto: partner.profilePhoto,
          nickname: partner.nickname,
          partnerNickname: partner.partnerNickname
        },
        lastMessage: room.lastMessage,
        lastMessageTime: room.lastMessageTime,
        unreadCount,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: formattedChatRooms
    });

  } catch (error) {
    console.error("Error getting chat rooms:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}; 