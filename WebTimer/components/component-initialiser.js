import facebookAuthButton from '/components/facebook-auth-button.js';
import mainMenu from '/components/main-menu.js';
import tabMenu from '/components/tab-menu.js';
import userTimers from '/components/user-timers.js';
import stopwatch from '/components/stopwatch.js';
import timer from '/components/timer.js';
import timerCustomised from '/components/timer-customised.js';
import userSettings from '/components/user-settings.js';
import AuthSession from '/components/auth-session.js';
import { authEventHelper } from '/components/event-bus.js';

new Vue({
    router: new VueRouter({
        routes: [
            {
                path: '/home',
                component: tabMenu,
                props: {
                    tabs: [
                        { name: 'Stopwatch', route: '/stopwatch' },
                        { name: 'Timer', route: '/timer' },
                        { name: 'Timer With Stages', route: '/timerCustomised' }
                    ]
                },
                children: [
                    { path: '/', redirect: '/stopwatch' },
                    { path: '/stopwatch', component: stopwatch },
                    { path: '/timer', component: timer },
                    { path: '/timerCustomised', component: timerCustomised }
                ]
            }, {
                path: '/profile',
                component: tabMenu,
                props: {
                    tabs: [
                        { name: 'Timers', route: '/profile/userTimers' },
                        { name: 'Settings', route: '/profile/userSettings' }
                    ]
                },
                children: [
                    { path: '/profile', redirect: '/profile/userTimers' },
                    {
                        path: '/profile/userTimers',
                        component: userTimers,
                        meta: { requiresAuth: true }
                    },
                    {
                        path: '/profile/userSettings',
                        component: userSettings,
                        meta: { requiresAuth: true }
                    }
                ]
            },
            { path: '/', redirect: '/home' }
        ]
    }),
    data() {
        return {
            authenticated: false
        };
    },
    mounted() {
        this.$router.beforeEach((to, from, next) => {
            next(to.matched.some(i => i.meta.requiresAuth) && !this.authenticated ? { path: '/' } : undefined);
        });
    },
    beforeDestroy() {
        authEventHelper.removeAllListeners();
    },
    methods: {
        setAuthenticationState(token) {
            let previousState = this.authenticated;
            this.authenticated = token != null;

            const authSession = new AuthSession();
            authSession.setToken(token);

            authEventHelper.emitEvent(token);
            
            if (previousState && !this.authenticated)
                this.$router.go('/');
        }
    },
    el: "#app",
    components: {
        mainMenu,
        facebookAuthButton
    }
});