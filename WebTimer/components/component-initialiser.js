import facebookAuthButton from '/components/facebook-auth-button.js';
import mainMenu from '/components/main-menu.js';
import tabMenu from '/components/tab-menu.js';
import userTimers from '/components/user-timers.js';
import stopwatch from '/components/stopwatch.js';
import timer from '/components/timer.js';
import timerCustomised from '/components/timer-customised.js';
import userSettings from '/components/user-settings.js';
import userStatistics from '/components/user-statistics.js';
import about from '/components/about.js';
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
                        { name: 'Settings', route: '/profile/userSettings' },
                        { name: 'Statistics', route: '/profile/userStatistics', requiresAdminRole: true }
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
                    },
                    {
                        path: '/profile/userStatistics',
                        component: userStatistics,
                        meta: { requiresAdminRole: true }
                    }
                ]
            },
            { path: '/about', component: about },
            { path: '/', redirect: '/home' }
        ]
    }),
    data() {
        return {
            authenticated: false,
            hasAdminRole: false
        };
    },
    mounted() {
        this.$router.beforeEach((to, from, next) => {
            let nextRoute;
            const defaultRoute = { path: '/' };

            if (to.matched.some(i => i.meta.requiresAuth || i.meta.requiresAdminRole) && !this.authenticated)
                nextRoute = defaultRoute;
            else if (to.matched.some(i => i.meta.requiresAdminRole) && !this.hasAdminRole)
                nextRoute = defaultRoute;

            next(nextRoute);
        });
    },
    beforeDestroy() {
        authEventHelper.removeAllListeners();
    },
    methods: {
        setAuthenticationState(token, hasAdminRole) {
            let wasAuthenticated = this.authenticated;

            this.authenticated = token != null;
            this.hasAdminRole = hasAdminRole != null;

            const authSession = new AuthSession();
            authSession.setToken(token);

            authEventHelper.emitEvent(token, hasAdminRole);
            
            if (wasAuthenticated && !this.authenticated) {
                this.$router.push('/');
                location.reload();
            }
        }
    },
    el: "#app",
    components: {
        mainMenu,
        facebookAuthButton
    }
});