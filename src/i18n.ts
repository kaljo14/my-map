import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import bg from './locales/bg.json'

const i18n = createI18n({
    legacy: false, // Use Composition API mode
    globalInjection: true, // Enable $t in templates
    locale: 'en', // set locale
    fallbackLocale: 'en', // set fallback locale
    messages: {
        en,
        bg
    }
})

export default i18n
