import { Message } from "node-nats-streaming";
import {
  Subjects,
  Listener,
  UserProfilePhotoCreatedEvent as UserProfilePhotoCreatedEventHeaven,
} from "@heaven-nsoft/my-love-common";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../Models/user";

export class UserPhotoCreatedEvent extends Listener<UserProfilePhotoCreatedEventHeaven> {
  subject: Subjects.UserProfilePhotoCreated = Subjects.UserProfilePhotoCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserProfilePhotoCreatedEventHeaven["data"], msg: Message) {
    try {

      const existsUser = await User.findById(data.photo.user)
      if (!existsUser) {
        return;
      }
      existsUser.profilePhoto = {
        thumbnailUrl: data.photo.thumbnailUrl,
        url: data.photo.url
      }
      await existsUser.save()
      console.log("user photo updated: ", JSON.stringify(existsUser.profilePhoto));
      msg.ack();
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }
}
