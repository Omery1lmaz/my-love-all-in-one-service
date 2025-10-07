"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const s3 = new aws_sdk_1.default.S3({
    credentials: {
        accessKeyId: "AKIA5AFSMOTRYTHQKGUN",
        secretAccessKey: "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",
    },
    region: "eu-north-1",
});
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: "my-love-app",
        acl: "public-read",
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        },
    }),
});
exports.default = upload;
