// Patches the broken bare specifier in @github/copilot-sdk@0.1.32.
// session.js and client.js import 'vscode-jsonrpc/node' without .js,
// which fails Node 22+ ESM resolution. We short-circuit to an absolute
// file URL so the exports map is bypassed entirely.
// Upstream: https://github.com/github/copilot-sdk/issues/707
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
// vscode-jsonrpc main = lib/node/main.js — go up two dirs to reach package root
const pkgRoot = join(dirname(require.resolve('vscode-jsonrpc')), '..', '..');
const nodeJsUrl = pathToFileURL(join(pkgRoot, 'node.js')).href;

export async function resolve(specifier, context, nextResolve) {
	// session.js uses bare 'vscode-jsonrpc/node', client.js uses 'vscode-jsonrpc/node.js'
	// both fail against the exports map — short-circuit both to the absolute file URL
	if (specifier === 'vscode-jsonrpc/node' || specifier === 'vscode-jsonrpc/node.js') {
		return { shortCircuit: true, url: nodeJsUrl };
	}
	return nextResolve(specifier, context);
}
