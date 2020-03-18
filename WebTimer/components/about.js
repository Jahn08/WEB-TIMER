import { ApiHelper } from '/components/api-helper.js';
import banner from '/components/banner.js';

const about = {
    components: {
        linkRow: {
            props: {
                href: {
                    type: String
                },
                id: {
                    required: true,
                    type: String
                },
                description: {
                    required: true,
                    type: String
                }
            },
            template: `
                 <div class="row">
                    <div class="col">
                        <a :id="id" class="badge badge-info" :href="href || '#'" target="_blank">
                            <slot></slot>
                        </a>
                        <label class="text-primary" :for="id">{{ description }}</label>
                    </div>
                </div>`
        },
        banner
    },
    data() {
        return {
            email: '',
            website: ''
        };
    },
    mounted() {
        const apiHelper = new ApiHelper();
        apiHelper.getAboutInfo().then(resp => this.initialiseData(resp)).catch(alert);
    },
    methods: {
        initialiseData(resp) {
            this.email = resp.email;
            this.website = resp.website;
        }
    },
    computed: {
        emailAddress() {
            return 'mailto:' + this.email;
        }
    },
    template: `
        <div>
            <banner heading="About"></banner>
            <div class="container">
                <link-row :href="emailAddress" id="email" description="for sending us a message">&#128231 Email</link-row>
                <link-row :href="website" id="website" description="for having a look at our other projects">&#127760 Website</link-row>
            </div>
        </div>`
};

export default about;