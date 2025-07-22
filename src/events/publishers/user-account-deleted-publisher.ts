import {
  Subjects,
  Publisher,
  UserAccountDeletedEvent,
} from "@heaven-nsoft/common";

export class UserAccountDeletedPublisher extends Publisher<UserAccountDeletedEvent> {
  subject: Subjects.UserAccountDeleted = Subjects.UserAccountDeleted;
}
