import {
  createSocialPreviewImage,
  socialPreviewAlt,
  socialPreviewContentType,
  socialPreviewSize,
} from "@/components/social/SocialPreviewImage";

export const alt = socialPreviewAlt;
export const size = socialPreviewSize;
export const contentType = socialPreviewContentType;

export default function OpenGraphImage() {
  return createSocialPreviewImage();
}
