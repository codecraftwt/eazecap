import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY,
  },
});
export const uploadFileToS3 = async (file: File, folder: string) => {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const fileKey = `${folder}/${fileName}`;

  // FIX: Convert File to Uint8Array for browser compatibility
  const arrayBuffer = await file.arrayBuffer();
  const fileBody = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
    Key: fileKey,
    Body: fileBody, // Use the converted body
    ContentType: file.type,
  });

  try {
    await s3Client.send(command);
    // This is the URL you were trying to open!
    return `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${fileKey}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};
// export const uploadFileToS3 = async (file: File, folder: string) => {
//   const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
//   const fileKey = `${folder}/${fileName}`;

//   // FIX: Convert File to ArrayBuffer to prevent stream errors
//   const arrayBuffer = await file.arrayBuffer();
//   const fileBody = new Uint8Array(arrayBuffer);

//   const command = new PutObjectCommand({
//     Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
//     Key: fileKey,
//     Body: fileBody, // Use the converted body here
//     ContentType: file.type,
//   });

//   try {
//     await s3Client.send(command);
//     return `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${fileKey}`;
//   } catch (error) {
//     console.error("S3 Upload Error:", error);
//     throw error;
//   }
// };