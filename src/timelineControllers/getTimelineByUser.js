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
exports.getTimeLineByUser = void 0;
const common_1 = require("@heaven-nsoft/common");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const timeline_1 = require("../Models/timeline");
const getTimeLineByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let decodedToken;
        try {
            decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        }
        catch (err) {
            console.log("err", err);
            next(new common_1.NotAuthorizedError());
            return;
        }
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id)) {
            console.log("no id");
            next(new common_1.NotAuthorizedError());
            return;
        }
        const timelines = yield timeline_1.Timeline.find({
            $or: [{ userId: decodedToken.id }, { partnerId: decodedToken.id }],
        }).populate("photos coverPhotoId");
        res.status(201).json({
            message: "Timelines get succesfully",
            status: "success",
            statusCode: 201,
            data: timelines,
        });
    }
    catch (error) {
        console.error("Error fetching timeline event:", error);
        res.status(500).json({ message: "Error fetching timeline event" });
    }
});
exports.getTimeLineByUser = getTimeLineByUser;
exports.default = exports.getTimeLineByUser;
