import { existsSync, unlinkSync, readdirSync } from "fs";
import { resolve, join } from "path";

export const createDirectoryIfNotExists = (dirPath) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

export const deleteFileIfExists = (filePath) => {
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  }
};

export const findFileByPattern = (folderPath, pattern) => {
  const files = readdirSync(folderPath);
  return files.find((file) => file.match(pattern));
};
