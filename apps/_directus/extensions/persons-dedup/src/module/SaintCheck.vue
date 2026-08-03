<template>
	<private-view title="Nouveau saint">
		<template #navigation>
			<ReactSlot :component="SongSearch" :component-props="songSearchProps" />
		</template>

		<div class="saints-dedup">
			<p class="intro">
				Vérifiez si le saint existe avant de créer une nouvelle fiche.
			</p>

			<form class="search-form" @submit.prevent="search">
				<v-input v-model="lastname" placeholder="Nom" autofocus />
				<v-input v-model="firstname" placeholder="Prénom" />
				<v-button type="submit" :disabled="!canSearch" :loading="loading">Rechercher</v-button>
			</form>

			<template v-if="searched">
				<div v-if="results.length" class="results">
					<v-list>
						<v-list-item v-for="saint in results" :key="saint.id" clickable @click="selectSaint(saint)">
							<v-list-item-content>
								<span v-if="saint.prefix" class="birthdate"> — né(e) le {{ saint.prefix }}</span>
								<strong>{{ saint.lastname }} {{ saint.firstname }}</strong>
								<span v-if="saint.suffix" class="birthdate"> — né(e) le {{ saint.suffix }}</span>
							</v-list-item-content>
						</v-list-item>
					</v-list>

					<v-notice type="info" class="fallback-notice">
						Aucun de ces saints ne correspond ?
						<button type="button" class="link-button" @click="createNew">Créer une nouvelle fiche</button>
					</v-notice>
				</div>

				<v-notice v-else type="warning">
					Aucun saint correspondant trouvé.
					<button type="button" class="link-button" @click="createNew">Créer une nouvelle fiche</button>
				</v-notice>
			</template>
		</div>
	</private-view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@directus/extensions-sdk';
import ReactSlot from './ReactSlot.vue';
import SongSearch from './Navigation';

const api = useApi();
const router = useRouter();

const lastname = ref('');
const firstname = ref('');
const results = ref([]);
const loading = ref(false);
const searched = ref(false);

const canSearch = computed(() => lastname.value.trim().length > 0);

function formatDate(value) {
	return new Date(value).toLocaleDateString('fr-FR');
}

async function search() {
	if (!canSearch.value) return;

	loading.value = true;
	try {
		const response = await api.get('/saints-dedup-api', {
			params: { lastname: lastname.value.trim(), firstname: firstname.value.trim() },
		});
		results.value = response.data.results ?? [];
		searched.value = true;

		if (results.value.length === 0) {
			createNew();
		}
	} catch (e) {
		results.value = [];
		searched.value = true;
	} finally {
		loading.value = false;
	}
}

function selectSaint(saint) {
	router.push(`/content/saints/${saint.id}`);
}

function createNew() {
	router.push({
		path: '/content/saints/+',
		query: { lastname: lastname.value.trim(), firstname: firstname.value.trim() },
	});
}

const songSearchProps = computed(() => ({
	value: null,
	disabled: false,
	placeholder: 'Rechercher un saint…',
	valuePath: 'title',
	search,
	router,
	onInput: () => {},
}));
</script>

<style scoped>
.saints-dedup {
	padding: 24px;
	max-width: 600px;
}
.intro {
	color: var(--foreground-subdued);
	margin-bottom: 20px;
}
.search-form {
	display: flex;
	gap: 12px;
	align-items: center;
	margin-bottom: 24px;
}
.results {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.birthdate {
	color: var(--foreground-subdued);
}
.fallback-notice {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
}
.link-button {
	background: none;
	border: none;
	padding: 0;
	color: var(--theme--primary, #6644ff);
	text-decoration: underline;
	cursor: pointer;
	font: inherit;
}
</style>
