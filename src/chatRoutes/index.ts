import express from "express";
import { sendMessageRouter } from "./sendMessage";
import { getMessagesRouter } from "./getMessages";
import { getChatRoomsRouter } from "./getChatRooms";
import { updateOnlineStatusRouter } from "./updateOnlineStatus";
import { getPartnerOnlineStatusRouter } from "./getPartnerOnlineStatus";
import { deleteMessageRouter } from "./deleteMessage";

const router = express.Router();

router.use(sendMessageRouter);
router.use(getMessagesRouter);
router.use(getChatRoomsRouter);
router.use(updateOnlineStatusRouter);
router.use(getPartnerOnlineStatusRouter);
router.use(deleteMessageRouter);

export { router as chatRouter }; 