"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../utils/multer-s3/upload"));
const createEvent_1 = __importDefault(require("../eventControllers/createEvent"));
const router = express_1.default.Router();
exports.createEventRouter = router;
router.post("/create-event", upload_1.default.array("photo", 10), 
// createEventExpressValidator,
// validateRequest,
createEvent_1.default);
