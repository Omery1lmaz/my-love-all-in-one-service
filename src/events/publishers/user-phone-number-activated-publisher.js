"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPhoneNumberUpdatedPublisher = void 0;
const common_1 = require("@heaven-nsoft/common");
class UserPhoneNumberUpdatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.UserPhoneNumberUpdated;
    }
}
exports.UserPhoneNumberUpdatedPublisher = UserPhoneNumberUpdatedPublisher;
