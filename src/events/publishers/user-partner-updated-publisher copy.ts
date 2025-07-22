import {
  Subjects,
  Publisher,
  UserPartnerUpdatedEvent as UserPartnerUpdatedEventHeaven,
} from "@heaven-nsoft/my-love-common";

export class UserPartnerUpdatedPublisher extends Publisher<UserPartnerUpdatedEventHeaven> {
  subject: Subjects.UserPartnerUpdated = Subjects.UserPartnerUpdated;
}
