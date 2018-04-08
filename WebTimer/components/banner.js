Components.banner = {
    props: {
        heading: {
            type: String,
            required: true
        }
    },
    template: `
        <div class="text-center alert alert-info">
            <h1 class="alert-heading">{{ heading }}</h1>
            <slot></slot>
        </div>`
}