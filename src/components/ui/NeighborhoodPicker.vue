<template>
  <div>
    <!-- Selected chips -->
    <div v-if="modelValue.length" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
      <div
        v-for="name in modelValue"
        :key="name"
        style="display:inline-flex;align-items:center;gap:3px;padding:2px 6px 2px 7px;background:#ede9fe;border-radius:4px;max-width:100%"
      >
        <span style="font-size:11px;font-weight:600;color:#4338ca;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px">{{ name }}</span>
        <button
          @click="remove(name)"
          style="background:none;border:none;cursor:pointer;padding:0;line-height:1;color:#6366f1;flex-shrink:0"
        ><span class="material-symbols-outlined" style="font-size:13px">close</span></button>
      </div>
      <button
        @click="$emit('update:modelValue', [])"
        style="display:inline-flex;align-items:center;gap:2px;padding:2px 7px;background:#fce7f3;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;color:#be185d"
      >
        <span class="material-symbols-outlined" style="font-size:12px">delete_sweep</span>Clear all
      </button>
    </div>

    <!-- Search input -->
    <div style="position:relative">
      <span class="material-symbols-outlined" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:14px;color:#94a3b8;pointer-events:none">search</span>
      <input
        v-model="query"
        type="text"
        :placeholder="modelValue.length ? `Add more… (${modelValue.length} selected)` : 'Search neighbourhood…'"
        @focus="open = true"
        @blur="onBlur"
        style="width:100%;box-sizing:border-box;padding:5px 8px 5px 28px;font-size:12px;border:1px solid #e2e8f0;border-radius:6px;outline:none;background:#f8fafc;color:#1e293b"
      />
    </div>

    <!-- Dropdown -->
    <div
      v-if="open && filtered.length"
      style="position:absolute;z-index:1000;left:12px;right:12px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-height:200px;overflow-y:auto;margin-top:2px"
    >
      <div
        v-for="name in filtered"
        :key="name"
        @mousedown.prevent="toggle(name)"
        style="display:flex;align-items:center;gap:7px;padding:6px 10px;cursor:pointer;font-size:12px;color:#1e293b"
        :style="{ background: modelValue.includes(name) ? '#ede9fe' : 'transparent' }"
        @mouseover="(e) => { if (!modelValue.includes(name)) (e.currentTarget as HTMLElement).style.background = '#f1f5f9' }"
        @mouseleave="(e) => { (e.currentTarget as HTMLElement).style.background = modelValue.includes(name) ? '#ede9fe' : 'transparent' }"
      >
        <span
          class="material-symbols-outlined"
          style="font-size:14px;flex-shrink:0"
          :style="{ color: modelValue.includes(name) ? '#6366f1' : '#cbd5e1' }"
        >{{ modelValue.includes(name) ? 'check_box' : 'check_box_outline_blank' }}</span>
        <span :style="{ fontWeight: modelValue.includes(name) ? '600' : '400', color: modelValue.includes(name) ? '#4338ca' : '#1e293b' }">{{ name }}</span>
      </div>
    </div>
    <div
      v-if="open && !filtered.length"
      style="position:absolute;z-index:1000;left:12px;right:12px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;font-size:12px;color:#94a3b8;margin-top:2px"
    >No results</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  modelValue: string[];
  neighborhoods: string[];
}>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>();

const query = ref('');
const open = ref(false);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? props.neighborhoods.filter(n => n.toLowerCase().includes(q)) : props.neighborhoods;
});

function toggle(name: string) {
  const next = props.modelValue.includes(name)
    ? props.modelValue.filter(n => n !== name)
    : [...props.modelValue, name];
  emit('update:modelValue', next);
}

function remove(name: string) {
  emit('update:modelValue', props.modelValue.filter(n => n !== name));
}

function onBlur() {
  setTimeout(() => { open.value = false; query.value = ''; }, 150);
}
</script>
