const defaultPrograms = [{
    name: 'Test program',
    active: true,
    stages: [{
        order: 0,
        duration: 5000,
        descr: 'First stage with rather a long description which should be cut to not look ugly on the timer form'
    }, {
        order: 1,
        duration: 3000,
        descr: 'Merely the second stage'
    }, {
        order: 2,
        duration: 3000,
        descr: 'The final step'
    }]
}, {
    name: 'Roasting peanuts in oven',
    active: true,
    stages: [{
        order: 0,
        duration: 30000,
        descr: 'Heat an oven'
    }, {
        order: 1,
        duration: 300000,
        descr: 'Roast firstly'
    }, {
        order: 2,
        duration: 10000,
        descr: 'Stir it up'
    }, {
        order: 3,
        duration: 300000,
        descr: 'Roast secondly'
    }, {
        order: 4,
        duration: 10000,
        descr: 'Stir it up'
    }, {
        order: 5,
        duration: 300000,
        descr: 'Final roasting'
    }, {
        order: 6,
        duration: 300000,
        descr: 'Let it ripen with the oven turned off'
    }]
}, {
	name: 'Cooking tomato soup with tinned chickpeas',
    active: true,
	stages: [{
		order: 0,
		duration: 120000,
		descr: 'Frying turmeric alongside diced onion'
	}, {
		order: 1,
		duration: 600000,
		descr: 'Stewing squashed tomatoes with the onion'
	}, {
		order: 2,
		duration: 1200000,
		descr: 'Add hot water and pasta, boil the mix-up'
	}, {
		order: 3,
		duration: 180000,
		descr: 'Add tinned chickpeas and carry on boiling'
	}, {
		order: 4,
		duration: 300000,
		descr: 'Turn off the cooker and let the meal calm down'
	}]
}];

module.exports = defaultPrograms;