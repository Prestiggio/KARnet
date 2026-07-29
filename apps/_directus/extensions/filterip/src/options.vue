<template>
  <div class="filter-memory-options">
    <div class="type-label">Colonnes affichées</div>
    <label v-for="field in fieldsInCollection" :key="field.field" class="field-option">
      <input type="checkbox" :checked="fields.includes(field.field)" @change="toggleField(field.field)" />
      {{ field.field }}
    </label>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    fields: { type: Array, default: () => [] },
    fieldsInCollection: { type: Array, default: () => [] },
  },
  emits: ['update:fields'],
  setup(props, { emit }) {
    function toggleField(fieldKey) {
      emit(
        'update:fields',
        props.fields.includes(fieldKey)
          ? props.fields.filter((f) => f !== fieldKey)
          : [...props.fields, fieldKey]
      );
    }

    return { toggleField };
  },
};
</script>

<style scoped>
.filter-memory-options { padding: 12px; }
.type-label { font-weight: 600; margin-bottom: 8px; }
.field-option { display: flex; align-items: center; gap: 8px; padding: 4px 0; cursor: pointer; }
</style>
