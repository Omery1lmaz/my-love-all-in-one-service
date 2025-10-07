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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleClient_1 = __importDefault(require("../utils/googleClient"));
const verifyIdToken = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield googleClient_1.default.verifyIdToken({
        idToken,
        audience: "946747520040-cktu628bd3tuc9v099pjic72vjd8p8hq.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    console.log(payload, "payload test deneme");
    return payload;
});
exports.default = verifyIdToken;
