import { authEventHelper } from '/components/event-bus.js';

const tabMenu = {
    props: {
        tabs: {
            required: true,
            type: Array
        }
    },
    data() {
        return {
            hasAdminRole: false
        };
    },
    mounted() {
        authEventHelper.addListener(this.setUserRole);
    },
    beforeDestroy() {
        authEventHelper.removeListener(this.setUserRole);
    },
    methods: {
        setUserRole(token, hasAdminRole) {
            this.hasAdminRole = hasAdminRole;
        }
    },
    template: `
        <div>
            <ul v-if='tabs' class="nav nav-tabs">
                <li v-for="t in tabs" class="nav-item">
                    <router-link v-if="!t.requiresAdminRole || hasAdminRole" class="nav-link" :to="t.route" active-class="active">{{ t.name }}</router-link>
                </li>
            </ul>

            <div class="mt-2">
                <router-view></router-view>
            </div>
        </div>`
};

export default tabMenu;