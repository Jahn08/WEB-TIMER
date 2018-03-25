var Components = {};

Components.clock = {
	data() {
		return {
            buttons: [{
                name: 'Start|Stop',
                shortcut: 'Space'
            }, {
                name: 'Lap',
                shortcut: 'Ctrl'
            }, {
               name: 'Reset',
               shortcut: 'Esc'
            }],
			time: '00:00:00'
		};
	},
	template: `<div class='container'>
		<div class="row">
            <div class="col text-center">
                <div class="border text-primary" style="font-size:8em;box-shadow: 2px 2px 10px">{{ time }}</div>
            </div>
        </div>
        <div class="row">
            <div class="col"></div>
            <div class="col-8 text-center">
                <div class="btn-group btn-group-lg">
                    <button v-for="button in buttons" :key="button.name" type="button" class="btn btn-outline-primary" style="white-space:pre-wrap">
                        <span>{{ button.name }} \n<span style='opacity:0.6'>press &lt;{{ button.shortcut }}&gt;</span></span>
                    </button>
                </div>
            </div>
            <div class="col"></div>
        </div>
    </div>`
};