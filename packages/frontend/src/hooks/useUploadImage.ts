import { useMutation } from "@tanstack/react-query";
import { uploadImgToCloudinary } from "@/utils/uploadImage";
import toast from "react-hot-toast";

interface MutationParams<T> {
  file: File;
  action?: (url: string) => T;
}

export function useUploadImage<T>() {
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file, action }: MutationParams<T>) => {
      const url = await uploadImgToCloudinary(file);

      if (action) await action(url);
    },
    onError: (err) => toast.error(err.message),
  });

  return { uploadImg: mutate, uploadingImg: isPending };
}
