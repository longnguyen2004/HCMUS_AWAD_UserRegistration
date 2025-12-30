import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.CLOUD_API_KEY,
  api_secret: env.CLOUD_API_SECRET,
});

export type CloudinaryUploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  raw: UploadApiResponse;
};

/**
 * Upload image and resize (keeps aspect ratio, will not upscale by default).
 * `source` can be a remote URL or local file path or base64 data URL.
 */
export async function uploadAndResize(
  source: string,
  width: number,
  height?: number,
  opts?: { folder?: string; publicId?: string; format?: string; allowUpscale?: boolean },
): Promise<CloudinaryUploadResult> {
  const transformation: UploadApiOptions["transformation"] = [
    {
      width,
      height: height ?? undefined,
      crop: opts?.allowUpscale ? "fill" : "limit",
      fetch_format: "auto",
      quality: "auto",
    },
  ];

  const uploadOptions: UploadApiOptions = {
    folder: opts?.folder,
    public_id: opts?.publicId,
    transformation,
    format: opts?.format,
  };

  const res = (await cloudinary.uploader.upload(source, uploadOptions)) as UploadApiResponse;

  return {
    publicId: res.public_id,
    url: res.url,
    secureUrl: res.secure_url,
    width: res.width,
    height: res.height,
    format: res.format,
    raw: res,
  };
}

/**
 * Upload image and auto-crop to a square using gravity:auto (best-effort).
 * Produces a square image of size `size` x `size`.
 */
export async function uploadAndAutoCropSquare(
  source: string,
  size = 500,
  opts?: { folder?: string; publicId?: string; format?: string },
): Promise<CloudinaryUploadResult> {
  const transformation: UploadApiOptions["transformation"] = [
    {
      width: size,
      height: size,
      crop: "thumb",
      gravity: "auto",
      fetch_format: "auto",
      quality: "auto",
    },
  ];

  const uploadOptions: UploadApiOptions = {
    folder: opts?.folder,
    public_id: opts?.publicId,
    transformation,
    format: opts?.format,
  };

  const res = (await cloudinary.uploader.upload(source, uploadOptions)) as UploadApiResponse;

  return {
    publicId: res.public_id,
    url: res.url,
    secureUrl: res.secure_url,
    width: res.width,
    height: res.height,
    format: res.format,
    raw: res,
  };
}

export const cloudinaryService = {
  uploadAndResize,
  uploadAndAutoCropSquare,
  client: cloudinary,
};

export default cloudinaryService;
