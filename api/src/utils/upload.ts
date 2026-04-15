import fs from 'fs';
import path from 'path';

import { Request } from 'express';
import formidable, { File } from 'formidable';

export const createDirectory = async (pathname: string): Promise<void> => {
  return new Promise((resolve, reject) => fs.mkdir(pathname, { recursive: true }, (err: Error) => (err ? reject(err) : resolve())));
};

export const uploadFiles = async (req: Request, uploadDirectory: string = path.resolve('tmp')): Promise<File[]> => {
  await createDirectory(uploadDirectory);
  const files: Record<string, File> = await new Promise((resolve, reject) => {
    const files: Record<string, File> = {};
    const form = formidable({ multiples: false, uploadDir: uploadDirectory });
    form.on('file', (name: string, file: File) => (files[name] = file));
    form.on('end', () => resolve(files));
    form.on('error', (err: Error) => reject(err));
    form.parse(req, null);
  });
  return Object.values(files);
};
