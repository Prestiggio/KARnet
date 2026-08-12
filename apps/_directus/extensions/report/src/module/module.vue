<template>
	<private-view :title="`${organization.name} - ${organization.parent?.name} - ${organization.parent?.parent?.name} - ${organization.parent?.parent?.parent?.name} | Tatitra pastoraly`">
		<template #navigation>
			<ReactSlot :component="Navigation"/>
		</template>
	</private-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue';
import ReactSlot from './ReactSlot.vue';
import Navigation from './Navigation';
import { useRouter } from 'vue-router';
import { useApi } from '@directus/extensions-sdk';

const props = defineProps<{
	primaryKey: string;
}>();

const api = useApi();

const router = useRouter();
const loading = ref(true);
const error = ref('');
const organization0: any = {}
const organization = ref(organization0)

async function fetchOrganization(date:string|null) {
	loading.value = true;
	error.value = '';

	try {
		const response = await api.get(`/items/organizations/${props.primaryKey}`, {
			params: {
				fields: [
					'name',
					'parent.name',
					'parent.parent.name',
					'parent.parent.parent.name',
					'parent.parent.parent.parent.name',
					'parent.parent.parent.parent.parent.name',
				]
			}
		});
		organization.value = response.data.data ?? {};

		const report = await api.get(`/report/${props.primaryKey}`)
		console.log('baabidi', report)
	} catch (e) {
		error.value = "Impossible de charger l'organigramme.";
	} finally {
		loading.value = false;
	}
}

onMounted(fetchOrganization)
</script>
