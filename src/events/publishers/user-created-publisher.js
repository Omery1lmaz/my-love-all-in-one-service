"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedPublisher = void 0;
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
class UserCreatedPublisher extends my_love_common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = my_love_common_1.Subjects.UserCreated;
    }
}
exports.UserCreatedPublisher = UserCreatedPublisher;
