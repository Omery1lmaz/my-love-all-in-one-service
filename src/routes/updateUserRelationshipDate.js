"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRelationshipDateRouter = void 0;
const express_1 = __importDefault(require("express"));
const updateUserrelationshipDate_1 = __importDefault(require("../controllers/updateUserrelationshipDate"));
const router = express_1.default.Router();
exports.updateUserRelationshipDateRouter = router;
router.post("/update-user-relationship-date", updateUserrelationshipDate_1.default);
