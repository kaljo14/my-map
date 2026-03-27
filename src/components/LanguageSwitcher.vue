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
    <span class="lang-code">{{ locale }}</span>
    <span class="sr-only">Switch Language</span>
    <span class="material-symbols-outlined" aria-hidden="true" style="font-size:16px;line-height:1">language</span>
  </button>
</template>

<style scoped>
.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(245, 240, 232, 0.12);
  background: transparent;
  color: #8a7e72;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.lang-btn:hover {
  background: rgba(245, 240, 232, 0.08);
  color: #c4b8ae;
  border-color: rgba(245, 240, 232, 0.2);
}

.lang-code {
  text-transform: uppercase;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
