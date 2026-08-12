<template>
  <div class="filter-memory-layout">
    <p v-if="restoredNotice" class="notice">
      Filtre précédent restauré pour « {{ collection }} ».
    </p>

    <table v-if="items && items.length">
      <thead>
        <tr>
          <th v-if="showSelect !== 'none'" class="select-col">
            <input
              v-if="showSelect === 'multiple'"
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll"
            />
          </th>
          <th>
            <v-icon name="account_tree" />
          </th>
          <th>
            <v-icon name="analytics" />
          </th>
          <th v-for="field in displayFields" :key="field" class="sortable" @click="toggleSort(field)">
            {{ field }}
            <span v-if="sortField === field" class="sort-indicator">{{ sortDesc ? '▼' : '▲' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item[primaryKeyFieldName]"
          class="selectable"
        >
          <td v-if="showSelect !== 'none'" class="select-col" @click.stop>
            <input
              :type="showSelect === 'multiple' ? 'checkbox' : 'radio'"
              :checked="isSelected(item)"
              @change="toggleSelection(item)"
            />
          </td>
          <td @click="onOrganigramClick(item)">
            <v-icon name="account_tree" />
          </td>
          <td @click="onReportClick(item)">
            <v-icon name="analytics" />
          </td>
          <td @click="onRowClick(item)" v-for="field in displayFields" :key="field">{{ formatValue(item[field]) }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="!loading">Aucun élément ne correspond au filtre courant.</p>
    <p v-else>Chargement…</p>

    <div v-if="totalPages > 1" class="pagination">
      <button type="button" :disabled="page <= 1" @click="page--">‹ Précédent</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button type="button" :disabled="page >= totalPages" @click="page++">Suivant ›</button>
    </div>
  </div>
</template>

<script>
import { watch, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi, useSync } from '@directus/extensions-sdk';

const STORAGE_PREFIX = 'directus_layout_filter_';
const PAGE_SIZE = 25;

export default {
  props: {
    collection: { type: String, required: true },
    filter: { type: Object, default: null },
    filterUser: { type: Object, default: null },
    search: { type: String, default: null },
    selection: { type: Array, default: () => [] },
    showSelect: { type: String, default: 'none' },
    selectMode: { type: Boolean, default: false },
    fields: { type: Array, default: () => [] },
    sort: { type: String, default: null },
    primaryKeyField: { type: Object, default: null },
  },
  emits: ['update:filter', 'update:selection', 'update:sort'],
  setup(props, { emit }) {
    const api = useApi();
    const router = useRouter();
    const items = ref([]);
    const loading = ref(false);
    const restoredNotice = ref(false);
    const page = ref(1);
    const totalCount = ref(0);
    const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)));

    const selectionWritable = useSync(props, 'selection', emit);
    const sortWritable = useSync(props, 'sort', emit);

    const primaryKeyFieldName = computed(() => props.primaryKeyField?.field ?? 'id');
    const displayFields = computed(() => props.fields);
    const apiFields = computed(() => {
      const pk = primaryKeyFieldName.value;
      return displayFields.value.includes(pk) ? displayFields.value : [pk, ...displayFields.value];
    });
    const sortField = computed(() => sortWritable.value?.replace(/^-/, '') ?? null);
    const sortDesc = computed(() => sortWritable.value?.startsWith('-') ?? false);
    const allSelected = computed(
      () => items.value.length > 0 && items.value.every((item) => isSelected(item))
    );

    const storageKey = () => STORAGE_PREFIX + props.collection;

    function formatValue(value) {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return value.name ?? JSON.stringify(value);
      return value;
    }

    function isSelected(item) {
      return selectionWritable.value.includes(item[primaryKeyFieldName.value]);
    }

    function toggleSelection(item) {
      const pk = item[primaryKeyFieldName.value];
      if (props.showSelect === 'one') {
        selectionWritable.value = isSelected(item) ? [] : [pk];
        return;
      }
      selectionWritable.value = isSelected(item)
        ? selectionWritable.value.filter((id) => id !== pk)
        : [...selectionWritable.value, pk];
    }

    function onRowClick(item) {
      if (props.showSelect !== 'none' && props.selectMode) {
        toggleSelection(item);
        return;
      }
      const pk = item[primaryKeyFieldName.value];
      router.push(`/content/${props.collection}/${encodeURIComponent(pk)}`);
    }

    function onOrganigramClick(item) {
      const pk = item[primaryKeyFieldName.value];
      router.push(`/organization/${encodeURIComponent(pk)}`);
    }

    function onReportClick(item) {
      const pk = item[primaryKeyFieldName.value];
      router.push(`/report/${encodeURIComponent(pk)}`);
    }

    function toggleSelectAll() {
      selectionWritable.value = allSelected.value
        ? []
        : items.value.map((item) => item[primaryKeyFieldName.value]);
    }

    function toggleSort(field) {
      if (sortField.value !== field) {
        sortWritable.value = field;
      } else if (!sortDesc.value) {
        sortWritable.value = `-${field}`;
      } else {
        sortWritable.value = null;
      }
    }

    // 1. Restauration automatique au montage, si aucun filtre actif
    onMounted(() => {
      const hasActiveFilter = props.filter && Object.keys(props.filter).length > 0;
      if (!hasActiveFilter) {
        const stored = window.localStorage.getItem(storageKey());
        if (stored) {
          try {
            const parsedFilter = JSON.parse(stored);
            emit('update:filter', parsedFilter);
            restoredNotice.value = true;
          } catch (e) {
            window.localStorage.removeItem(storageKey());
          }
        }
      }
      fetchItems();
    });

    // 2. Capture automatique à chaque changement de filtre effectué par l'utilisateur
    watch(
      () => props.filter,
      (newFilter) => {
        if (newFilter && Object.keys(newFilter).length > 0) {
          window.localStorage.setItem(storageKey(), JSON.stringify(newFilter));
        } else {
          window.localStorage.removeItem(storageKey());
        }
        page.value = 1;
        fetchItems();
      },
      { deep: true }
    );

    watch(() => props.collection, () => {
      page.value = 1;
      fetchItems();
    });
    watch(() => props.search, () => {
      page.value = 1;
      fetchItems();
    });
    watch(() => props.fields, () => {
      fetchItems();
    });
    watch(sortWritable, () => {
      fetchItems();
    });
    watch(page, () => {
      fetchItems();
    });

    async function fetchItems() {
      loading.value = true;
      try {
        const response = await api.get(`/items/${props.collection}`, {
          params: {
            fields: [primaryKeyFieldName.value, 'name', 'level', 'abbreviation', 'parent.name'],
            filter: props.filter || undefined,
            search: props.search || undefined,
            sort: sortWritable.value || undefined,
            limit: PAGE_SIZE,
            offset: (page.value - 1) * PAGE_SIZE,
            meta: 'filter_count',
          },
        });
        items.value = response.data.data;
        totalCount.value = response.data.meta?.filter_count ?? items.value.length;
      } catch (e) {
        items.value = [];
        totalCount.value = 0;
      } finally {
        loading.value = false;
      }
    }

    return {
      items,
      loading,
      restoredNotice,
      displayFields,
      page,
      totalPages,
      formatValue,
      primaryKeyFieldName,
      isSelected,
      toggleSelection,
      onOrganigramClick,
      onReportClick,
      onRowClick,
      toggleSelectAll,
      allSelected,
      sortField,
      sortDesc,
      toggleSort,
    };
  },
};
</script>

<style scoped>
.filter-memory-layout { padding: 16px; }
.notice { color: #6644ff; margin-bottom: 12px; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #eee; }
th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover { background: rgba(0, 0, 0, 0.03); }
tr.selectable { cursor: pointer; }
tr.selectable:hover { background: rgba(0, 0, 0, 0.03); }
.sort-indicator { font-size: 0.75em; margin-left: 4px; }
.select-col { width: 32px; text-align: center; padding: 6px; }
.pagination { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
.pagination button { cursor: pointer; }
.pagination button:disabled { cursor: not-allowed; opacity: 0.5; }
</style>
