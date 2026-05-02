// Patches the broken bare specifier in @github/copilot-sdk@0.1.32.
// session.js imports 'vscode-jsonrpc/node' without the .js extension,
// which fails Node 22+ strict ESM resolution. This loader rewrites it.
// Upstream: https://github.com/github/copilot-sdk/issues/707
export async function resolve(specifier, context, nextResolve) {
	if (specifier === 'vscode-jsonrpc/node') {
		return nextResolve('vscode-jsonrpc/node.js', context);
	}
	return nextResolve(specifier, context);
}
