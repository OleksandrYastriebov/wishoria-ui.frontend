import { uploadImage } from '../api/endpoints';

export const handleImageUpload = async (file: File): Promise<string> => {
  const result = await uploadImage(file);
  return result.url;
};

export const fileToBase64DataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
