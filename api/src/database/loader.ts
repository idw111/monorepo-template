import { readdir } from 'fs/promises';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadModels = async (modelsDir: string): Promise<any[]> => {
  try {
    const modelFiles = (await readdir(modelsDir)).filter(
      (file) =>
        (file.endsWith('.ts') || file.endsWith('.js')) &&
        !file.endsWith('.d.ts') &&
        !file.endsWith('.d.js') &&
        !file.includes('.test.') &&
        !file.includes('.spec.')
    );

    const models = await Promise.all(
      modelFiles.map(async (file) => {
        try {
          const filePath = path.join(modelsDir, file);
          const modelName = file.replace(/\.(ts|js)$/, '');
          const module = await import(filePath);
          let model = module.default || module[modelName] || module[modelName.charAt(0).toUpperCase() + modelName.slice(1)];

          if (!model) {
            const exports = Object.keys(module);
            console.warn(`Model not found in ${file}. Available exports: ${exports.join(', ')}`);
          }

          return model;
        } catch (err) {
          console.error(`Error loading model from ${file}:`, err);
          throw err;
        }
      })
    );

    return models.filter(Boolean);
  } catch (err) {
    console.error(`Error loading models from ${modelsDir}:`, err);
    throw err;
  }
};
