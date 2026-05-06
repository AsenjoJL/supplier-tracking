import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/config/firebase";

export async function uploadFile(path: string, file: File): Promise<string> {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function deleteFile(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}
