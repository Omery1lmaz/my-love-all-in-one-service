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
exports.checkRegisterEmailController = void 0;
const user_1 = require("../Models/user");
const checkRegisterEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_1.User.findOne({ email });
    if (user) {
        res.status(409).json({ message: "Bu kullanıcı zaten mevcut" });
        return;
    }
    res.status(200).json({ exists: false });
});
exports.checkRegisterEmailController = checkRegisterEmailController;
exports.default = exports.checkRegisterEmailController;
