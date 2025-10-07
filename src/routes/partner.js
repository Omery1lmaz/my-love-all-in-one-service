"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerRouter = void 0;
const express_1 = __importDefault(require("express"));
const partner_1 = require("../controllers/partner");
const router = express_1.default.Router();
exports.partnerRouter = router;
router.put("/update-partner-info", partner_1.updatePartnerInfo);
