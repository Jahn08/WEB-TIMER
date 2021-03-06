﻿import banner from './banner.js';
import authListener from './auth-listener.js';
import { UserApi } from './api.js';
import { cardSection } from './bootstrap-controls.js';

const sortLink = {
    props: {
        header: {
            required: true,
            type: String
        },
        active: false
    },
    data() {
        return {
            state: 0,
            descState: -1,
            ascState: 1
        };
    },
    watch: {
        active() {
            this.state = this.active ? this.descState : 0;
        }
    },
    mounted() {
        this.state = this.active ? this.descState: 0;
    },
    methods: {
        onClick() {
            this.state = this.state == this.descState ? this.ascState : this.descState;
            this.$emit('click', this.header, this.state);
        }
    },
    computed: {
        symbol() {
            if (this.state == 0)
                return '';

            return this.state == this.descState ? '&#9660;': '&#9650;';
        }
    },
    template: `
        <button type="button" @click="onClick" class="btn btn-link">{{ header }} <span v-html="symbol"></span></button>`
};

const userStatistics = {
    components: {
        banner,
        cardSection,
        authListener,
        sortLink
    },
    data() {
        return {
            users: [],
            queryFilter: {
                page: 1,
                searchFor: '',
                sortField: null,
                sortDirection: null
            },
            pageCount: 1,
            api: null,
            headers: [{ key: 'name', value: 'Name' },
                { key: 'gender', value: 'Gender' },
                { key: 'location', value: 'Location' },
                { key: 'administrator', value: 'Administrator' },
                { key: 'createdAt', value: 'Created' },
                { key: 'lastLogin', value: 'Last Activity' }],
            curUserId: null
        };
    },
    filters: {
        toShortDateFormat(val) {
            const formatDatePart = (val) => ('00' + val).slice(-2);
            const dateVal = Date.parse(val);

            if (isNaN(dateVal))
                return '';

            const date = new Date(dateVal);
            return `${date.getUTCFullYear()}-${formatDatePart(date.getUTCMonth() + 1)}-${formatDatePart(date.getUTCDate())} 
                ${formatDatePart(date.getUTCHours())}:${formatDatePart(date.getUTCMinutes())}`; 
        }
    },
    methods: {
        goToPage(pageNum) {
            this.queryFilter.page = pageNum;
            this.getUsersInfoFromServer();
        },
        goToNextPage(changeIndex) {
            const pageNum = Number.parseInt(this.queryFilter.page);

            if (!isNaN(pageNum))
                this.goToPage(pageNum + changeIndex);
        },
        onAuthenticationChange(authToken) {
            if (!authToken)
                return;

            this.api = new UserApi(authToken);
            this.getUsersInfoFromServer();
        },
        getUsersInfoFromServer() {
            this.api.getStatistics(this.queryFilter).then(resp => {
                if (resp) {
                    this.curUserId = resp.curUserId;
                    this.users = resp.users;
                    this.queryFilter = resp.queryFilter;
                    this.pageCount = resp.pageCount;
                }
            }).catch(alert);
        },
        trySearchForText(event) {
            if (event.key === 'Enter')
                this.searchForText();
        },
        searchForText() {
            this.getUsersInfoFromServer();
        },
        sortLinkClicked(header, direction) {
            const activeHeader = this.headers.find(h => h.value == header);

            if (activeHeader) {
                this.queryFilter.sortField = activeHeader.key;
                this.queryFilter.sortDirection = direction;

                this.getUsersInfoFromServer();
            }
        },
        switchAdminRole(user) {
            if (confirm(`${user.name} will be ${user.administrator ? 'deprived of' : 'granted'} the administrative role. ` +
                    'The user will get the respective message. Continue?')) {
                this.api.switchAdminRole(user._id)
                    .then(outcome => user.administrator = outcome.administrator)
                    .catch(alert);
            }
        }
    },
    template: `
         <auth-listener @change="onAuthenticationChange">
            <banner heading="Statistics"></banner>
            <card-section header="List of Users">
                <div class="form-inline">
                    <input type="search" placeholder="Search by text fields..." class="form-control" 
                        v-model="queryFilter.searchFor" @keyup="trySearchForText" aria-label="Search" />
                    <button type="button" class="btn btn-outline-info" @click="searchForText">Search</button>
                </div>
                <table class="table table-striped">
                    <tr>
                        <th v-for="h in headers" :key="h.key">
                            <sort-link :header="h.value" :active="queryFilter.sortField == h.key" @click="sortLinkClicked"></sort-link>
                        </th>
                        <th class="text-secondary">Active Timer Programs</th>
                    </tr>
                    <tbody>
                        <tr v-for="user in users">
                            <td>{{ user.name }}</td>
                            <td>{{ user.gender }}</td>
                            <td>{{ user.location }}</td>
                            <td>{{ user.administrator }} <button v-if="user._id !== curUserId" class="btn btn-link" @click="switchAdminRole(user)">(switch)</button></td>
                            <td>{{ user.createdAt | toShortDateFormat }}</td>
                            <td>{{ user.lastLogin | toShortDateFormat }}</td>
                            <td class="text-secondary">{{ user.activeProgramCount }}</td>
                        </tr>
                    </tbody>
                </table>
                <nav aria-label="Page navigation">
                    <ul class="pagination">
                        <li class="page-item">
                            <button type="button" @click="goToNextPage(-1)" :disabled="queryFilter.page == 1" class="page-link" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                                <span class="sr-only">Previous</span>
                            </button>
                        </li>
                        <li class="page-item" v-for="p in pageCount" :class="{ 'active': p == queryFilter.page }">
                            <button type="button" class="page-link" @click="goToPage(p)" :disabled="p == queryFilter.page">{{ p }}</button>
                        </li>
                        <li class="page-item">
                            <button type="button" @click="goToNextPage(1)" :disabled="queryFilter.page == pageCount" class="page-link" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                                <span class="sr-only">Next</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </card-section>
         </auth-listener>`
};

export default userStatistics;