import Keycloak from 'keycloak-js';
import { ref } from 'vue';

const keycloakUrl = (window as any).KEYCLOAK_URL === "__KEYCLOAK_URL_PLACEHOLDER__"
    ? 'http://localhost:8081' // Default for local dev
    : (window as any).KEYCLOAK_URL;

const keycloak = new Keycloak({
    url: keycloakUrl,
    realm: 'barbershop-realm',
    clientId: 'barbershop-app',
});

const isAuthenticated = ref(false);
const userProfile = ref<any>(null);

const initKeycloak = async () => {
    try {
        const authenticated = await keycloak.init({
            onLoad: 'login-required',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            pkceMethod: 'S256',
        });

        isAuthenticated.value = authenticated;

        if (authenticated) {
            try {
                userProfile.value = await keycloak.loadUserProfile();
            } catch (error) {
                console.error('Failed to load user profile', error);
            }
        }
    } catch (error) {
        console.error('Keycloak init failed', error);
    }
};

const login = () => {
    keycloak.login();
};

const logout = () => {
    keycloak.logout();
};

const getToken = () => {
    return keycloak.token;
};

export default {
    initKeycloak,
    login,
    logout,
    getToken,
    isAuthenticated,
    userProfile,
};
