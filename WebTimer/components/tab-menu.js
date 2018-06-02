Components.tabMenu = {
    template: `
        <div>
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <router-link class="nav-link" to="/stopwatch" active-class="active">Stopwatch</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/timer" active-class="active">Timer</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/timerCustomised" active-class="active">Timer With Stages</router-link>
                </li>
            </ul>

            <div class="mt-2">
                <router-view></router-view>
            </div>
        </div>`
};