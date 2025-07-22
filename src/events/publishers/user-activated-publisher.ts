import { Subjects, Publisher, UserActivatedEvent } from "@heaven-nsoft/common";

export class UserActivatedPublisher extends Publisher<UserActivatedEvent> {
  subject: Subjects.UserActivated = Subjects.UserActivated;
}
