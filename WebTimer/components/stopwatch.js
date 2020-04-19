import watch from './watch.js';
import banner from './banner.js';

const stopwatch = {
    components: {
        watch,
        banner
    },
    template: `
        <div>
            <banner heading="Stopwatch"></banner>
            <watch :clockwise="true"></watch>
        </div>
    `
};

export default stopwatch;