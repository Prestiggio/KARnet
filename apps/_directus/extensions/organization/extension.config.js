import image from '@rollup/plugin-image';

// Le bundler de l'extensions-sdk ne sait pas importer les fichiers non-JS
// (.jpg/.png/... -> data URI base64 via ce plugin ; .yml/.yaml -> texte brut,
// à parser soi-même avec `yaml`).
function yaml() {
	return {
		name: 'yaml',
		transform(code, id) {
			if (!id.endsWith('.yml') && !id.endsWith('.yaml')) return null;
			return {
				code: `export default ${JSON.stringify(code)};`,
				map: { mappings: '' },
			};
		},
	};
}

export default {
	plugins: [image(), yaml()],
};
