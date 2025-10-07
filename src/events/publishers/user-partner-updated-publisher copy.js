"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPartnerUpdatedPublisher = void 0;
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
class UserPartnerUpdatedPublisher extends my_love_common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = my_love_common_1.Subjects.UserPartnerUpdated;
    }
}
exports.UserPartnerUpdatedPublisher = UserPartnerUpdatedPublisher;
