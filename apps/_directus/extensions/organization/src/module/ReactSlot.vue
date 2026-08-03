<template>
	<div ref="container" class="react-slot"></div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { ComponentType } from 'react';

const props = defineProps<{
	component: ComponentType<any>;
	componentProps?: Record<string, unknown>;
}>();

const container = ref<HTMLElement | null>(null);
let root: Root | null = null;

function render(): void {
	if (!root) return;
	root.render(React.createElement(props.component, props.componentProps ?? {}));
}

// Le slot dans lequel ce composant est placé (ex. #navigation de private-view)
// peut être monté après ce composant, container.value n'est donc pas garanti
// d'être prêt au premier tick.
watch(container, (el) => {
	if (el && !root) {
		root = createRoot(el);
		render();
	}
});

watch(() => props.componentProps, render, { deep: true });
watch(() => props.component, render);

onBeforeUnmount(() => {
	root?.unmount();
	root = null;
});
</script>
