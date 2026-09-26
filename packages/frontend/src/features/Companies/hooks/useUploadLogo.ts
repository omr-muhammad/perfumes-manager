import { useMutation } from "@tanstack/react-query";
import { uploadImgToCloudinary } from "../../../utils/uploadImage";

export function useUploadLogo() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: uploadImgToCloudinary,
  });

  return { uploadCoLogo: mutateAsync, uploadingLogo: isPending };
}
