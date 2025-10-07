"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivatedPublisher = void 0;
const common_1 = require("@heaven-nsoft/common");
class UserActivatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.UserActivated;
    }
}
exports.UserActivatedPublisher = UserActivatedPublisher;
