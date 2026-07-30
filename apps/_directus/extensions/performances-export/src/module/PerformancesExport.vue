<template>
	<private-view title="Export Performances">
		<div class="performances-export">
			<p class="intro">
				Sélectionnez les performances à exporter dans un document Word (.docx).
			</p>

			<v-notice v-if="error" type="danger" class="notice">{{ error }}</v-notice>

			<template v-if="loading">
				<v-progress-circular indeterminate />
			</template>

			<template v-else>
				<div class="toolbar">
					<v-checkbox
						:model-value="allSelected"
						:indeterminate="someSelected && !allSelected"
						label="Tout sélectionner"
						@update:model-value="toggleAll"
					/>
					<v-button :disabled="!selected.size || exporting" :loading="exporting" @click="exportSelected">
						Exporter en DOCX ({{ selected.size }})
					</v-button>
				</div>

				<v-notice v-if="!performances.length" type="info">Aucune performance trouvée.</v-notice>

				<v-list v-else>
					<v-list-item v-for="performance in performances" :key="performance.id" clickable @click="toggle(performance.id)">
						<v-list-item-icon>
							<v-checkbox :model-value="selected.has(performance.id)" @click.stop @update:model-value="toggle(performance.id)" />
						</v-list-item-icon>
						<v-list-item-content>
							<strong>{{ performance.song?.title }}</strong>
							<span class="song-title">{{ performance.song?.composer?.lastname }} — {{ performance.date_created }}</span>
						</v-list-item-content>
					</v-list-item>
				</v-list>
			</template>
		</div>
	</private-view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@directus/extensions-sdk';

const api = useApi();

const performances = ref([]);
const selected = ref(new Set());
const loading = ref(true);
const exporting = ref(false);
const error = ref('');

const allSelected = computed(() => performances.value.length > 0 && selected.value.size === performances.value.length);
const someSelected = computed(() => selected.value.size > 0);

function toggle(id) {
	const next = new Set(selected.value);
	if (next.has(id)) next.delete(id);
	else next.add(id);
	selected.value = next;
}

function toggleAll(value) {
	selected.value = value ? new Set(performances.value.map((p) => p.id)) : new Set();
}

async function fetchPerformances() {
	loading.value = true;
	error.value = '';
	try {
		const response = await api.get('/items/performances', {
			params: {
				fields: ['id', 'title', 'song.title', 'song.composer.lastname', 'date_created'],
				sort: ['-date_created'],
				limit: -1,
			},
		});
		performances.value = response.data.data ?? [];
	} catch (e) {
		error.value = "Impossible de charger les performances.";
	} finally {
		loading.value = false;
	}
}

async function exportSelected() {
	if (!selected.value.size) return;

	exporting.value = true;
	error.value = '';
	try {
		const response = await api.post(
			'/performances-export-api',
			{ ids: Array.from(selected.value) },
			{ responseType: 'blob' }
		);

		const url = URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'performances.docx';
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	} catch (e) {
		error.value = "L'export a échoué.";
	} finally {
		exporting.value = false;
	}
}

onMounted(fetchPerformances);
</script>

<style scoped>
.performances-export {
	padding: 24px;
	max-width: 700px;
}
.intro {
	color: var(--foreground-subdued);
	margin-bottom: 20px;
}
.notice {
	margin-bottom: 20px;
}
.toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 16px;
}
.song-title {
	color: var(--foreground-subdued);
}
</style>
