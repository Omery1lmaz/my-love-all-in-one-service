"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResetPasswordToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, partnerId) => {
    console.log(process.env.SECRET_KEY, "secret key test deneme");
    return jsonwebtoken_1.default.sign({ id, partnerId: partnerId }, process.env.SECRET_KEY, {
        expiresIn: maxAge,
    });
};
exports.createToken = createToken;
const createResetPasswordToken = (jwtInformation) => {
    return jsonwebtoken_1.default.sign(jwtInformation, process.env.RESET_PASSWORD_SECRET_KEY, {
        expiresIn: "15m",
    });
};
exports.createResetPasswordToken = createResetPasswordToken;
