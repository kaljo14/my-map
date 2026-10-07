import { onMounted, onUnmounted } from 'vue'

export function useRevealAnimations() {
  const observers: IntersectionObserver[] = []

  function setup() {
    document.querySelectorAll('.reveal-section').forEach((el) => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            entries[0].target.classList.add('revealed')
          }
        },
        { threshold: 0.1 },
      )
      observer.observe(el)
      observers.push(observer)
    })
  }

  onMounted(() => {
    setTimeout(setup, 100)
  })

  onUnmounted(() => {
    observers.forEach((o) => o.disconnect())
  })
}
