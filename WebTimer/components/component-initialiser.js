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
import RouteFormState from '/components/route-form-state.js';
import { authEventHelper } from '/components/event-bus.js';
import { RouteDescriptor, MetaConstructor } from '/components/route-meta.js';

// eslint-disable-next-line no-undef
new Vue({
    // eslint-disable-next-line no-undef
    router: new VueRouter({
        mode: 'history',
        routes: [
            {
                path: '/',
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
                    { 
                        path: '/stopwatch', 
                        component: stopwatch ,
                        meta: MetaConstructor.produce(new RouteDescriptor('Stopwatch', 
                            'Online stopwatch to start, stop or reset time while storing laps', '/'))
                    },
                    { 
                        path: '/timer', 
                        component: timer,
                        meta: MetaConstructor.produce(new RouteDescriptor('Timer', 
                            'Online timer with setting an alarm and storing laps'))
                    },
                    { 
                        path: '/timerCustomised', 
                        component: timerCustomised,
                        meta: MetaConstructor.produce(new RouteDescriptor('Timer With Stages', 
                            'Online timer split into substages with setting an alarm and storing laps'))
                    }
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
                        meta: MetaConstructor.produce(
                            new RouteDescriptor(
                                'Personal Timers', 
                                'Set up your own timers fitting your personal needs',
                                '/profile'), 
                            true)
                    },
                    {
                        path: '/profile/userSettings',
                        component: userSettings,
                        meta: MetaConstructor.produce(
                            new RouteDescriptor(
                                'Personal Settings', 
                                'Set up personal preferences: choose a default alarm sound, hide predefined timer programs'), 
                            true)
                    },
                    {
                        path: '/profile/userStatistics',
                        component: userStatistics,
                        meta: MetaConstructor.produce(
                            new RouteDescriptor('Users Statistics', 
                                'Figure out more about who has used Web Timer'),
                            undefined, true)
                    },
                ]
            },
            { 
                path: '/about', 
                component: about,
                meta: MetaConstructor.produce(new RouteDescriptor('About', 'Contact information'))
            }
        ]
    }),
    data() {
        return {
            authenticated: false,
            hasAdminRole: false
        };
    },
    mounted() {
        const processRoute = (to, from, next) => {
            const metas = to.matched.map(i => new MetaConstructor(i.meta));
            
            if ((!from || this.redirectToNextRoute(metas, from, next)) && metas.length)
                metas[metas.length - 1].applyDescriptor();
        };

        this.$router.onReady(() => processRoute(this.$router.currentRoute));
        this.$router.beforeEach(processRoute);
    },
    beforeDestroy() {
        authEventHelper.removeAllListeners();
    },
    methods: {
        setAuthenticationState(token, hasAdminRole) {
            const wasAuthenticated = this.authenticated;

            this.authenticated = token != null;
            this.hasAdminRole = hasAdminRole != null;

            const authSession = new AuthSession();
            authSession.setToken(token);

            authEventHelper.emitEvent(token, hasAdminRole);
            
            if (wasAuthenticated && !this.authenticated) {
                this.$router.push('/');
                location.reload();
            }
        },
        redirectToNextRoute(metas, from, next) {
            let nextRoute;
            const defaultRoute = { path: '/' };

            const state = new RouteFormState(from);
            const isDirty = state.isDirty();

            let isAllowed = true;

            if (!isDirty || confirm('All unsaved changes will be lost. Continue?')) {
                if (isDirty)
                    state.makePure();

                if ((!this.authenticated && metas.some(m => m.isAuthRequired())) || 
                    (!this.hasAdminRole && metas.some(m => m.isForAdmin()))) {
                    isAllowed = false;
                    nextRoute = defaultRoute;
                }

                next(nextRoute);
                return isAllowed;
            }
        }
    },
    el: '#app',
    components: {
        mainMenu,
        facebookAuthButton
    }
});