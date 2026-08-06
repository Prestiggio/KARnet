<template>
	<private-view title="Organisations">
		<template #navigation>
			<ReactSlot :component="Navigation" :component-props="organigramProps" />
		</template>

		<div>
			<ReactSlot :component="Organigram" :component-props="organigramProps" />
		</div>
	</private-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue';
import ReactSlot from './ReactSlot.vue';
import Organigram from './Organigram';
import Navigation from './Navigation';
import { useRouter } from 'vue-router';
import { useApi } from '@directus/extensions-sdk';
import moment from 'moment';

const props = defineProps<{
	primaryKey: string;
}>();

const api = useApi();

const router = useRouter();
const loading = ref(true);
const error = ref('');
const tree = ref({})
const positioned = ref({
	nodes: [],
	edges: []
})

async function fetchOrganization(date:string|null) {
	loading.value = true;
	error.value = '';

	try {
		const response = await api.get(`/organigram/${props.primaryKey}`, {
			params: {
				date: date ?? moment().format('YYYY-MM-DD')
			},
		});
		tree.value = response.data ?? {};

		const responsePositioned = await api.get(`/organigram/${props.primaryKey}/position`, {
			params: {
				root: 0
			},
		});
		positioned.value = responsePositioned.data ?? {
			nodes: [],
			edges: []
		};
	} catch (e) {
		error.value = "Impossible de charger l'organigramme.";
	} finally {
		loading.value = false;
	}
}

onMounted(fetchOrganization)

const organigramProps = computed(() => ({
	router,
	api,
	tree: toRaw(tree.value),
	positioned: toRaw(positioned.value),
	organizationId: props.primaryKey
}));
</script>
