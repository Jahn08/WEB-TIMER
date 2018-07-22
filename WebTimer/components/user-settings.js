import banner from '/components/banner.js';

const userSettings = {
    components: {
        banner
    },
    data() {
        return {
            saving: false,
            user: {
                name: "TEST USER",
                email: "test@somemail.com",
                hideDefaultPrograms: true
            },
            restrictions: {
                name: {
                    maxlength: 0
                },
                email: {
                    maxlength: 0
                }
            }
        };
    },
    methods: {
        update() {

        },
        removeProfile() {
            if (confirm('You are going to delete your profile alongside all the timer programs you have created. Continue?')) {

            }
        }
    },
    template: `
        <div>
            <banner heading="User Settings"></banner>
            <div v-if="saving">Please wait...</div>
            <div v-else class="container">
                <div class="form-group">
                    <label for="nameTxt">Name</label>
                    <div>
                        <input placeholder="Profile name" type="text" class="form-control" :maxlength="restrictions.name.maxlength" required id="nameTxt" v-model="user.name" />
                        <div class="invalid-feedback">Please provide your profile name</div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="emailTxt">Email</label>
                    <div>
                        <input placeholder="Email address" type="email" class="form-control" :maxlength="restrictions.email.maxlength" required id="emailTxt" v-model="user.email" />
                        <div class="invalid-feedback">Please provide your email</div>
                    </div>
                </div>
                <div class="form-group form-check">
                    <input type="checkbox" class="form-check-input" id="hideDefaultProgramsCheck" v-model="user.hideDefaultPrograms">
                    <label class="form-check-label" for="hideDefaultProgramsCheck">Hide default programs</label>
                </div>
                <button type="button" class="btn btn-primary" @click="update">Update</button>
                <button type="button" class="btn btn-info" @click="removeProfile">Remove Profile</button>
            </div>
        </div>`
};

export default userSettings;