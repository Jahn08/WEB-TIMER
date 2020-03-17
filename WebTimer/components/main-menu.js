const mainMenu = {
    template: `
        <div>
		    <nav class="navbar navbar-expand-lg navbar-light bg-info">
                <router-link class="navbar-brand" to="/" active-class="active">
                    <img style="width:32px; height:32px" src="/resources/images/favicon-navbar.ico"
                        alt="Alarm clock referring to Home page with stopwatch" />
                </router-link>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item active">
                            <router-link class="nav-link" to="/home" active-class="active">
                                Home<span class="sr-only">(current)</span>
                            </router-link>
                        </li>
                        <li class="nav-item active">
                            <router-link class="nav-link" to="/about" active-class="active">
                                About
                            </router-link>
                        </li>
                    </ul>
                    <slot name="logInBtn"></slot>
                </div>
            </nav>
            <br />
            <router-view></router-view> 
        </div>`
};

export default mainMenu;