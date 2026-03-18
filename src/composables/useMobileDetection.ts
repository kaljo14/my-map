import { ref, onMounted, onUnmounted } from 'vue';

export function useMobileDetection() {
    const isMobile = ref(false);

    const checkMobile = () => {
        isMobile.value = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    };

    onMounted(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', checkMobile);
    });

    return { isMobile };
}
