const tabMenu = {
    props: {
        tabs: {
            required: true
        }
    },
    template: `
        <div>
            <ul v-if='tabs' class="nav nav-tabs">
                <li v-for="t in tabs" class="nav-item">
                    <router-link class="nav-link" :to="t.route" active-class="active">{{ t.name }}</router-link>
                </li>
            </ul>

            <div class="mt-2">
                <router-view></router-view>
            </div>
        </div>`
};

export default tabMenu;