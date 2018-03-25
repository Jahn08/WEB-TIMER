var Components = {};

Components.clock = {
	data() {
		return {
			buttons: ['Start', 'Stop', 'Circle'],
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
                    <button v-for="button in buttons" type="button" class="btn btn-outline-primary"><span>{{ button }}</span></button>
                </div>
            </div>
            <div class="col"></div>
        </div>
    </div>`
};