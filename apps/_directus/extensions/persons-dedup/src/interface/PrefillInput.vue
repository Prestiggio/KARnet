<template>
	<v-input :model-value="value" :disabled="disabled" :placeholder="placeholder" @update:model-value="$emit('input', $event)" />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
	value: { type: String, default: null },
	disabled: { type: Boolean, default: false },
	placeholder: { type: String, default: null },
	field: { type: String, default: null },
	queryParam: { type: String, default: null },
});
const emit = defineEmits(['input']);
const route = useRoute();

onMounted(() => {
	const param = props.queryParam || props.field;
	const fromQuery = param ? route.query[param] : undefined;

	if (props.value) return;
	if (!param) return;
	if (typeof fromQuery !== 'string' || fromQuery.trim().length === 0) return;

	// Plusieurs champs pré-remplis en même temps sur le formulaire de création
	// entrent en course avec l'initialisation du parent : selon des facteurs
	// de timing internes à Directus, une écriture tardive basée sur un état
	// périmé peut écraser la nôtre. Plutôt que d'émettre une seule fois, on
	// réaffirme la valeur pendant quelques secondes jusqu'à ce qu'elle tienne.
	const start = Date.now();
	const interval = setInterval(() => {
		if (props.value === fromQuery) {
			clearInterval(interval);
			return;
		}
		if (Date.now() - start > 5000) {
			clearInterval(interval);
			return;
		}
		emit('input', fromQuery);
	}, 150);
	emit('input', fromQuery);
});
</script>
