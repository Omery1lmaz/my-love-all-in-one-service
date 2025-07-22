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

export const uploadToS3 = async (fileBuffer: Buffer, fileName: string, mimeType: string) => {
  const result = await s3
    .upload({
      Bucket: "my-love-app",
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: "public-read",
    })
    .promise();

  return result.Location;
};

const upload = multer({
  storage: multer.memoryStorage(),
});

export default upload;
