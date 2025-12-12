export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,") to get just the base64 string for the API if needed
      // But typically for the API we send the raw base64. 
      // The `reader.result` includes the prefix.
      // We need to strip it for the Gemini API inlineData.data field usually, 
      // but let's keep the full string here and strip it in the service or component.
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};