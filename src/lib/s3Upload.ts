/**
 * Uploads a file directly to a pre-signed S3 URL using PUT
 * @param uploadUrl - The pre-signed URL received from the backend
 * @param file - The File object from the input change event
 */
export const uploadBinaryToS3 = async (uploadUrl: string, file: File): Promise<Response> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file, // File objects are handled as binary blobs by fetch
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("S3 Upload Error Body:", errorBody);
    throw new Error(`Failed to upload to S3: ${response.statusText}`);
  }

  return response;
};