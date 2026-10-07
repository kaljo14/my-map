<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const toggleLocale = () => {
    const nextLocale = locale.value === 'en' ? 'bg' : 'en'
    locale.value = nextLocale
}
</script>

<template>
  <button
    @click="toggleLocale"
    class="lang-btn"
    :title="$t('common.language', 'Language')"
  >
    <span class="material-symbols-outlined" aria-hidden="true">language</span>
    <span class="lang-code">{{ locale }}</span>
  </button>
</template>

<style scoped>
.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 7px;
  border: 1px solid rgba(245, 240, 232, 0.12);
  background: transparent;
  color: #8a7e72;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.lang-btn:hover {
  background: rgba(245, 240, 232, 0.08);
  color: #c4b8ae;
  border-color: rgba(245, 240, 232, 0.2);
}

.lang-code {
  text-transform: uppercase;
}

.lang-btn .material-symbols-outlined {
  font-size: 14px;
  line-height: 1;
}
</style>
