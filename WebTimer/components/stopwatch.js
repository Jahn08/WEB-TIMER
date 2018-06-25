import watch from '/components/watch.js';
import banner from '/components/banner.js';

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