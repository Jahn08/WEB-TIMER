const modal = {
    props: {
        title: {
            required: true,
            type: String
        },
        show: {
            type: Boolean
        }
    },
    watch: {
        show() {
            if (this.show)
                $('#modal').modal();
        }
    },
    mounted() {
        $('#modal').on('hide.bs.modal', e => {
            this.$emit('hiding');
        });
    },
    methods: {
        onKeyUp() {
            $('#modal').modal('hide');
        }
    },
    template: `
        <div class="modal fade" id="modal" tabindex="-1" v-on:keyup.enter="onKeyUp" v-on:keyup.space="onKeyUp">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header alert alert-info">
                        <h2 class="modal-title">{{ title }}</h2>
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body text-primary">
                        <slot></slot>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>`
};

const cardSection = {
    props: {
        header: {
            required: true,
            type: String
        }
    },
    template: `
        <div class="card border-info">
            <h2 class="card-header">{{ header }}</h2>
            <div class="card-body">
                <slot></slot>
            </div>
        </div>`
};

export { modal, cardSection };