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
    class="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
    :title="$t('common.language', 'Language')"
  >
    <span class="uppercase">{{ locale }}</span>
    <span class="sr-only">Switch Language</span>
    <!-- Globe icon -->
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  </button>
</template>
