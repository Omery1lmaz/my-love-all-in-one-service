"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRelationshipDateRouter = void 0;
const express_1 = __importDefault(require("express"));
const getUserRelationshipDate_1 = __importDefault(require("../controllers/getUserRelationshipDate"));
const router = express_1.default.Router();
exports.getUserRelationshipDateRouter = router;
router.get("/relationship-date", getUserRelationshipDate_1.default);
