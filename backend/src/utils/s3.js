import crypto from "crypto";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

const bucketName = process.env.S3_BUCKET_NAME;

function createS3ObjectKey({ userId, albumId, originalName }) {
  const extension = path.extname(originalName);
  const randomFileName = crypto.randomBytes(16).toString("hex");

  return `users/${userId}/albums/${albumId}/${randomFileName}${extension}`;
}

async function uploadFileToS3({ file, userId, albumId }) {
  if (!bucketName) {
    throw new Error("S3 bucket name is missing.");
  }

  const key = createS3ObjectKey({
    userId,
    albumId,
    originalName: file.originalname,
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return key;
}

async function getSignedMediaUrl(filePath) {
  if (!bucketName) {
    throw new Error("S3 bucket name is missing.");
  }

  if (!filePath) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filePath,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 60 * 10,
  });
}

async function deleteFileFromS3(filePath) {
  if (!bucketName) {
    throw new Error("S3 bucket name is missing.");
  }

  if (!filePath) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: filePath,
  });

  await s3Client.send(command);
}

export { uploadFileToS3, getSignedMediaUrl, deleteFileFromS3 };
