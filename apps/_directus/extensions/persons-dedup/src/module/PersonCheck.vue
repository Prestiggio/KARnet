<template>
	<private-view title="Nouvelle personne">
		<div class="persons-dedup">
			<p class="intro">
				Vérifiez si la personne est déjà fichée avant de créer une nouvelle fiche.
			</p>

			<form class="search-form" @submit.prevent="search">
				<v-input v-model="lastname" placeholder="Nom" autofocus />
				<v-input v-model="firstname" placeholder="Prénom" />
				<v-button type="submit" :disabled="!canSearch" :loading="loading">Rechercher</v-button>
			</form>

			<template v-if="searched">
				<div v-if="results.length" class="results">
					<v-list>
						<v-list-item v-for="person in results" :key="person.id" clickable @click="selectPerson(person)">
							<v-list-item-content>
								<strong>{{ person.lastname }} {{ person.firstname }}</strong>
								<span v-if="person.birthdate" class="birthdate"> — né(e) le {{ formatDate(person.birthdate) }}</span>
							</v-list-item-content>
						</v-list-item>
					</v-list>

					<v-notice type="info" class="fallback-notice">
						Aucune de ces personnes ne correspond ?
						<button type="button" class="link-button" @click="createNew">Créer une nouvelle fiche</button>
					</v-notice>
				</div>

				<v-notice v-else type="warning">
					Aucune personne correspondante trouvée.
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
		const response = await api.get('/persons-dedup-api', {
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

function selectPerson(person) {
	router.push(`/content/persons/${person.id}`);
}

function createNew() {
	router.push({
		path: '/content/persons/+',
		query: { lastname: lastname.value.trim(), firstname: firstname.value.trim() },
	});
}
</script>

<style scoped>
.persons-dedup {
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
