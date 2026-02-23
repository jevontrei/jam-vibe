import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION!;
const bucket = process.env.AWS_S3_BUCKET_NAME!;

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/** Build a public URL for an object in the JAM S3 bucket. */
export function getImageUrl(s3Key: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}

export { bucket };
