import tailwindcss from '@tailwindcss/postcss';

// rollup-plugin-styler (used by directus-extension build) resolves string
// plugin names with the legacy `resolve` package, which ignores package.json
// "exports" and can't find @tailwindcss/postcss. Passing the plugin instance
// directly skips that resolution step.
export default {
	plugins: [tailwindcss()],
};
