import AuthSession from '/components/auth-session.js';
import { authEventHelper } from '/components/event-bus.js';

const authListener = {
    data() {
        return {
            authenticated: false
        };
    },
    mounted() {
        const authSession = new AuthSession();
        const authToken = authSession.getToken();

        if (authToken) {
            this.onAuthenticationChange(authToken);
            this.initialised = true;
        }

        authEventHelper.addListener(this.onAuthenticationChange);
    },
    beforeDestroy() {
        authEventHelper.removeListener(this.onAuthenticationChange);
    },
    methods: {
        onAuthenticationChange(authToken) {
            this.authenticated = authToken != undefined;

            if (this.initialised && this.authenticated) {
                this.initialised = false;
                return;
            }

            this.$emit('change', authToken);
        }
    },
    template: `
        <div v-if="authenticated">
            <slot></slot>
        </div>`
};

export default authListener;