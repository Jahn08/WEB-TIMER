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
    data() {
        return {
            accepted: false
        };
    },
    watch: {
        show() {
            if (this.show)
                $('#modal').modal();
        }
    },
    mounted() {
        $('#modal').on('hide.bs.modal', e => {
            let accepted;

            if (this.accepted) {
                accepted = true;
                this.accepted = false;
            }
            else 
                accepted = false;

            this.$emit('hiding', accepted);
        });
    },
    methods: {
        onAccept() {
            this.accepted = true;
        }
    },
    template: `
        <div class="modal fade" id="modal">
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
                            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="onAccept()">OK</button>
                        </div>
                    </div>
                </div>
            </div>`
};

export default modal;