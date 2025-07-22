import {
  Subjects,
  Publisher,
  UserProfileUpdatedEvent,
} from "@heaven-nsoft/common";

export class UserProfileUpdatedPublisher extends Publisher<UserProfileUpdatedEvent> {
  subject: Subjects.UserProfileUpdated = Subjects.UserProfileUpdated;
}
