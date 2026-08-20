import { AppError } from "../utils/AppError";

interface Result {
  result: {
    id: string;
    uploadURL: string;
  };
  result_info: null;
  success: boolean;
  errors: [];
  messages: [];
}

// Cloudflare
export async function uploadImage() {
  const accId = Bun.env.cloudflare_account_id;
  const token = Bun.env.cloudflare_img_api_token;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accId}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const data = (await res.json()) as Result;

  if (!data.success) throw new AppError(400, "Failed to get upload error.");

  return { uploadUrl: data.result.uploadURL, imageId: data.result.id };
}
