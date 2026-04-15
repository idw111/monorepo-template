import { readdir } from 'fs/promises';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadModels = async (modelDir: string): Promise<any[]> => {
  const modelFiles = (await readdir(modelDir)).filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'));
  const models = await Promise.all(
    modelFiles.map(async (file) => {
      const module = await import(`${modelDir}/${file}`);
      return module[file.replace(/\.ts$/, '')];
    })
  );
  return models;
};
