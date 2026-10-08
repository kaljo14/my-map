import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Run the application's TypeScript with Node's test runner, using Vite's alias.
// No browser, credentials, network services, or additional test packages needed.
export function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      specifier = new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href;
    } else if (specifier.startsWith('.') && context.parentURL?.endsWith('.ts') && !/\.[a-z]+$/.test(specifier)) {
      specifier += '.ts';
    }
    return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
    if (!url.endsWith('.ts') || url.includes('/node_modules/')) return nextLoad(url, context);
    const source = readFileSync(new URL(url), 'utf8').replaceAll('import.meta.env', '({ DEV: false })');
    return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
      }).outputText,
    };
}
