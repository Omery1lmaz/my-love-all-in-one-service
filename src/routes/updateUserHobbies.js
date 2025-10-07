"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserHobbiesRouter = void 0;
const express_1 = __importDefault(require("express"));
const my_love_common_1 = require("@heaven-nsoft/my-love-common");
const updateUserHobbies_1 = __importDefault(require("../controllers/updateUserHobbies"));
const updateUserHobbies_2 = __importDefault(require("../expressValidators/updateUserHobbies"));
const router = express_1.default.Router();
exports.updateUserHobbiesRouter = router;
router.post("/update-user-hobbies", updateUserHobbies_2.default, my_love_common_1.validateRequest, updateUserHobbies_1.default);
