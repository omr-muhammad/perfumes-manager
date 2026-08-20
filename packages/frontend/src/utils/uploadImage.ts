const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface CloudflareUploadResult {
  result: {
    id: string;
    variants: string[]; // public URLs for each configured variant
  };
  success: boolean;
}

export async function uploadImgToCloudinary(file: File) {
  validateImage(2, file);

  const formData = new FormData();

  const id = crypto.randomUUID();
  const name = file.name.slice(0, file.name.lastIndexOf("."));
  const newName = `${name}-${id}`;
  const renamedFile = new File([file], newName, { type: file.type });

  formData.append("file", renamedFile);
  formData.append("upload_preset", uploadPreset!);
  formData.append("public_id", newName);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  console.log("res: ", res);
  if (!res.ok) throw new Error("Failed to upload image.");

  const data = await res.json();

  return data.secure_url as string;
}

export async function uploadToCloudflare(uploadUrl: string, file: File) {
  validateImage(2, file);

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(uploadUrl, { method: "POST", body: formData });

  console.log("Cloudflare Response: ", res);

  if (!res.ok) throw new Error("Failed to upload");

  const data: CloudflareUploadResult = await res.json();

  console.log("DATA from cloudflare: ", data);

  return { imgId: data.result.id, imgUrl: data.result.variants[0] };
}

function validateImage(maxSize: number = 2, file: File) {
  const maxAllowedSize = maxSize * 1024 * 1024;

  if (file.size > maxAllowedSize)
    throw new Error("Image size must be less than 2MB.");

  if (!file.type.startsWith("image/"))
    throw new Error("Only image files are allowed.");
}
