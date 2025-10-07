"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPhotoCreatedEvent = void 0;
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const queue_group_name_1 = require("./queue-group-name");
const user_1 = require("../../Models/user");
class UserPhotoCreatedEvent extends my_love_common_1.Listener {
    constructor() {
        super(...arguments);
        this.subject = my_love_common_1.Subjects.UserProfilePhotoCreated;
        this.queueGroupName = queue_group_name_1.queueGroupName;
    }
    onMessage(data, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existsUser = yield user_1.User.findById(data.photo.user);
                if (!existsUser) {
                    return;
                }
                existsUser.profilePhoto = {
                    thumbnailUrl: data.photo.thumbnailUrl,
                    url: data.photo.url
                };
                yield existsUser.save();
                console.log("user photo updated: ", JSON.stringify(existsUser.profilePhoto));
                msg.ack();
            }
            catch (error) {
                console.error("Error processing event:", error);
            }
        });
    }
}
exports.UserPhotoCreatedEvent = UserPhotoCreatedEvent;
