import { defineLayout, useCollection, useSync } from '@directus/extensions-sdk';
import { computed, toRefs } from 'vue';
import LayoutComponent from './layout.vue';
import LayoutOptions from './options.vue';

export default defineLayout({
  id: 'filter-memory',
  name: 'Tableau (mémorise le filtre)',
  icon: 'bookmark',
  component: LayoutComponent,
  slots: {
    options: LayoutOptions,
    sidebar: () => null,
    actions: () => null,
  },
  setup(props, { emit }) {
    const { collection } = toRefs(props);
    const layoutQuery = useSync(props, 'layoutQuery', emit);

    // `collection` is typed against the root project's `vue`, while `useCollection` expects a
    // `Ref` from the SDK's own bundled `vue` copy (duplicate vue installs, same shape at runtime).
    const { fields: fieldsInCollection, primaryKeyField } = useCollection(collection as any);

    const fieldsDefaultValue = computed(() =>
      fieldsInCollection.value
        .filter((field) => !field.meta?.hidden)
        .slice(0, 6)
        .map(({ field }) => field)
    );

    const fields = computed({
      get() {
        return layoutQuery.value?.fields?.length ? layoutQuery.value.fields : fieldsDefaultValue.value;
      },
      set(value) {
        layoutQuery.value = Object.assign({}, layoutQuery.value, { fields: value });
      },
    });

    const sort = computed({
      get() {
        return layoutQuery.value?.sort?.[0] ?? null;
      },
      set(value) {
        layoutQuery.value = Object.assign({}, layoutQuery.value, { sort: value ? [value] : [] });
      },
    });

    return { fieldsInCollection, primaryKeyField, fields, sort };
  },
});
