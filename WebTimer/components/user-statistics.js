import banner from '/components/banner.js';
import ApiHelper from '/components/api-helper.js';
import { cardSection } from '/components/bootstrap-controls.js';

const userStatistics = {
    components: {
        banner,
        cardSection
    },
    data() {
        return {
            users: []
        };
    },
    template: `
         <div>
            <banner heading="Statistics"></banner>
            <card-section header="List of Users">
                <table class="table table-striped">
                    <tr>
                        <th>Name</th>
                        <th>Active Timer Programs</th>
                        <th>Gender</th>
                        <th>Location</th>
                        <th>Administrator</th>
                        <th>Last Login</th>
                    </tr>                    
                    <tr v-for="user in users">
                        <td>{{ user.name }}</td>
                        <td></td>
                        <td>{{ user.gender }}</td>
                        <td>{{ user.location }}</td>
                        <td>{{ user.administrator }}</td>
                        <td>{{ user.lastLogin }}</td>
                    </tr>
                </table>
            </card-section>
         </div>`
};

export default userStatistics;