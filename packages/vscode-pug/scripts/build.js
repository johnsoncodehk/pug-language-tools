require('esbuild').context({
	entryPoints: {
		client: './out/client.js',
		server: './node_modules/@volar/pug-language-server/bin/pug-language-server.js',
	},
	bundle: true,
	metafile: process.argv.includes('--metafile'),
	outdir: './dist/node',
	external: [
		'vscode',
	],
	format: 'cjs',
	platform: 'node',
	tsconfig: '../../tsconfig.build.json',
	minify: process.argv.includes('--minify'),
	plugins: [
		{
			name: 'umd2esm',
			setup(build) {
				build.onResolve({ filter: /^(vscode-.*|estree-walker|jsonc-parser)/ }, args => {
					const pathUmdMay = require.resolve(args.path, { paths: [args.resolveDir] })
					// Call twice the replace is to solve the problem of the path in Windows
					const pathEsm = pathUmdMay.replace('/umd/', '/esm/').replace('\\umd\\', '\\esm\\')
					return { path: pathEsm }
				})
			},
		},
	],
}).then(async ctx => {
	console.log('building...');
	if (process.argv.includes('--watch')) {
		await ctx.watch();
		console.log('watching...');
	} else {
		await ctx.rebuild();
		await ctx.dispose();
		console.log('finished.');
	}
})
