Components.stopwatch = {
    components: {
        'watch': Components.watch,
        'banner': Components.banner
    },
    template: `
        <div>
            <banner heading="Stopwatch"></banner>
            <watch :clockwise="true"></watch>
        </div>
    `
};