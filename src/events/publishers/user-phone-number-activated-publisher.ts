import {
  Subjects,
  Publisher,
  UserPhoneNumberUpdatedEvent,
} from "@heaven-nsoft/common";

export class UserPhoneNumberUpdatedPublisher extends Publisher<UserPhoneNumberUpdatedEvent> {
  subject: Subjects.UserPhoneNumberUpdated = Subjects.UserPhoneNumberUpdated;
}
