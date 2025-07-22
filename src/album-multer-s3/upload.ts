import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: "AKIA5AFSMOTRYTHQKGUN",
    secretAccessKey: "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",
  },
  region: "eu-north-1",
});

const upload = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: "my-love-app",
    acl: "public-read",
    metadata: (req: any, file: any, cb: any) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req: any, file: any, cb: any) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

export default upload;
