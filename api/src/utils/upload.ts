import { mkdir } from 'fs/promises';
import path from 'path';
import { Request } from 'express';
import formidable, { File } from 'formidable';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export const createDirectory = async (pathname: string): Promise<void> => {
  await mkdir(pathname, { recursive: true });
};

export const uploadFiles = async (req: Request, uploadDirectory: string = path.resolve('tmp')): Promise<File[]> => {
  await createDirectory(uploadDirectory);
  const files: Record<string, File> = await new Promise((resolve, reject) => {
    const files: Record<string, File> = {};
    const form = formidable({ multiples: false, uploadDir: uploadDirectory, maxFileSize: MAX_FILE_SIZE, maxFiles: MAX_FILES });
    form.on('file', (name: string, file: File) => (files[name] = file));
    form.on('end', () => resolve(files));
    form.on('error', (err: Error) => reject(err));
    form.parse(req, () => {});
  });
  return Object.values(files);
};
