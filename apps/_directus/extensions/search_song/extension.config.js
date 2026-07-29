import replace from '@rollup/plugin-replace';

// Le bundler de l'extensions-sdk ne définit pas process.env.NODE_ENV,
// or react/react-dom y font référence -> on le remplace au build.
export default {
	plugins: [
		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
			preventAssignment: true,
		}),
	],
};
