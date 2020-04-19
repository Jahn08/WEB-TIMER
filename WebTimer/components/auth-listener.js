import AuthSession from './auth-session.js';
import { authEventHelper } from './event-bus.js';

const authListener = {
    data() {
        return {
            authenticated: false,
            authToken: null
        };
    },
    mounted() {
        const authSession = new AuthSession();
        this.authToken = authSession.getToken();

        this.onAuthenticationChange(this.authToken);
        this.initialised = true;

        authEventHelper.addListener(this.onAuthenticationChange);
    },
    beforeDestroy() {
        authEventHelper.removeListener(this.onAuthenticationChange);
    },
    methods: {
        onAuthenticationChange(authToken) {
            const previousStatus = this.authenticated;
            this.authenticated = authToken != undefined;

            if (this.initialised && this.authToken == authToken) {
                this.initialised = false;
                return;
            }

            const loggedOut = previousStatus && !this.authenticated;
            this.$emit('change', authToken, loggedOut);
        }
    },
    template: `
        <div v-if="authenticated">
            <slot></slot>
        </div>`
};

export default authListener;