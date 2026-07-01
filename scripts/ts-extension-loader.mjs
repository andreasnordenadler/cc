import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = process.cwd();

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    return nextResolve(pathToFileURL(path.join(root, 'src', specifier.slice(2))).href + '.ts', context);
  }
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND' && (specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/'))) {
      const fallback = context.parentURL && (specifier.startsWith('./') || specifier.startsWith('../'))
        ? new URL(`${specifier}.ts`, context.parentURL).href
        : `${specifier}.ts`;
      return nextResolve(fallback, context);
    }
    if (error?.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('file:')) {
      return nextResolve(`${specifier}.ts`, context);
    }
    throw error;
  }
}
