<template>
	<div ref="container" class="song-search-root"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useApi } from '@directus/extensions-sdk';
import SongSearch, { type SongHit } from './SongSearch';

const props = withDefaults(
	defineProps<{
		value: string | null;
		disabled?: boolean;
		esIndex?: string;
		valuePath?: string;
		mapping?: Record<string, string> | string | null;
		placeholder?: string;
	}>(),
	{
		disabled: false,
		esIndex: 'songs',
		valuePath: 'title',
		mapping: null,
		placeholder: 'Rechercher une chanson…',
	},
);

const emit = defineEmits<{
	(e: 'input', value: string | null): void;
	(e: 'setFieldValue', payload: { field: string; value: unknown }): void;
}>();

const api = useApi();
const container = ref<HTMLElement | null>(null);
let root: Root | null = null;

/** Résout un chemin "a.b.c" dans un objet. */
function get(obj: unknown, path: string): unknown {
	return path.split('.').reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function parsedMapping(): Record<string, string> {
	if (!props.mapping) return {};
	if (typeof props.mapping === 'string') {
		try {
			return JSON.parse(props.mapping);
		} catch {
			return {};
		}
	}
	return props.mapping;
}

async function search(query: string): Promise<SongHit[]> {
	const res = await api.get('/song-search-api', {
		params: { q: query, index: props.esIndex },
	});
	return res.data?.results ?? [];
}

async function handleSelect(song: SongHit): Promise<void> {
	// 1. Valeur du champ courant
	const ownValue = get(song, props.valuePath);
	emit('input', ownValue == null ? null : String(ownValue));

	// 2. Pré-remplissage des autres champs.
	// ⚠️ Directus ne conserve que le dernier `setFieldValue` émis dans un même tick :
	// il faut attendre nextTick() entre chaque émission.
	for (const [field, path] of Object.entries(parsedMapping())) {
		await nextTick();
		const value = get(song, path);
		if (value !== undefined) {
			emit('setFieldValue', { field, value });
		}
	}
}

function render(): void {
	if (!root) return;
	root.render(
		React.createElement(SongSearch, {
			value: props.value,
			disabled: props.disabled,
			placeholder: props.placeholder,
			valuePath: props.valuePath,
			search,
			onSelect: handleSelect,
			onInput: (v: string | null) => emit('input', v),
		}),
	);
}

onMounted(() => {
	if (container.value) {
		root = createRoot(container.value);
		render();
	}
});

// Re-render React quand les props Directus changent
watch(
	() => [props.value, props.disabled, props.placeholder, props.esIndex],
	() => render(),
);

onBeforeUnmount(() => {
	root?.unmount();
	root = null;
});
</script>

<style scoped>
.song-search-root {
	width: 100%;
}
</style>
