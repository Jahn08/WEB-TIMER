Components.timeSwitchBlock = {
    props: {
        figure: {
            type: Number,
            required: true
        },
        focused: {
            type: Boolean,
            default: false
        },
        max: {
            type: Number,
            default: 9
        }
    },
    data() {
        return {
            value: null
        };
    },
    mounted() {
        Components.globalVm.$on('watchKeyDown', this.onKeyDown);

        this.setFigure(this.figure);
    },
    beforeDestroy() {
        Components.globalVm.$off('watchKeyDown', this.onKeyDown);
    },
    watch: {
        figure() {
            this.setFigure(this.figure, false, false);
        }
    },
    methods: {
        setFigure(value, raiseEvent, round = true, entered = false) {
            this.value = value;

            if (this.value > this.max)
                this.value = round ? 0 : this.max;

            if (this.value < 0)
                this.value = round ? this.max : 0;

            if (raiseEvent) {
                this.$emit('switched', {
                    id: this.$attrs.id,
                    value: this.value,
                    entered
                });
            }
        },
        onKeyDown(event) {
            let keyVal;

            if (this.focused && event.key && (keyVal = event.key.trim()) && !isNaN(keyVal = Number(keyVal)))
                this.setFigure(keyVal, true, false, true);
        },
        increment() {
            this.setFigure(this.value + 1, true);
        },
        decrement() {
            this.setFigure(this.value - 1, true);
        }
    },
    template: `
        <span :class="{'text-info':focused}" style="display:inline-block">
            <div class="switch upperSwitch" @click="increment">&#10224;</div>
            <div>{{ value }}</div>
            <div class="switch belowSwitch" @click="decrement">&#10225;</div>
        </span>`
};

Components.timeSwitch = {
    data() {
        return {
            input: [],
            values: [],
            curIndex: 0,
            limits: [2, 9, 5, 9, 5, 9],
            idPrefix: 'f',
            changedInternally: false // To prevent changes caused by the component itself
        };
    },
    props: {
        text: {
            type: String,
            required: true
        }
    },
    mounted() {
        if (this.text)
            this.renderText();
    },
    watch: {
        text() {
            if (!this.changedInternally)
                this.renderText();
            else
                this.changedInternally = false;
        }
    },
    components: {
        'block': Components.timeSwitchBlock
    },
    methods: {
        renderText() {
            let mas = this.text.split(',');

            this.input = mas[0].split('');

            let val;
            let _i = 0;
            this.values = this.input.slice()
                .map(v => isNaN(val = Number(v)) ? v : { val, max: this.limits[_i++] });
            this.curIndex = this.getCurrentIndex();
        },
        getCurrentIndex(id) {
            const defaultIndex = this.values.length - 1;

            if (!id)
                return defaultIndex;

            let mas = this.values.slice(0, id);
            let index = mas.length;

            while (--index >= 0) {
                if (mas[index].max)
                    break;
            }

            return index < 0 ? defaultIndex : index;
        },
        onChange(event) {
            if (event.id && !isNaN(event.value)) {
                let id = event.id.slice(-1);
                this.input[id] = '' + event.value;
                this.values[id].val = event.value;
                
                if (event.entered)
                    this.curIndex = this.getCurrentIndex(this.curIndex);

                this.changedInternally = true;
                this.$emit('change', this.input.join(''));
            }
        }
    },
    template: `
        <span>
            <span v-for="s, j in values">
                <block v-if="s.max" :focused="curIndex == j" :id="idPrefix + j" :figure="s.val" @switched="onChange" :max="s.max"></block>
                <span v-else>{{ s }}</span>
            </span>
        </span>`
};