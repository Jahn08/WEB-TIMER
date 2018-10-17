const defaultPrograms = [{
    name: 'Test program',
    active: true,
    audioBetweenStages: true,
    stages: [{
        order: 0,
        duration: 5,
        descr: 'First stage with rather a long description which should be cut to not look ugly on the timer form'
    }, {
        order: 1,
        duration: 3,
        descr: 'Merely the second stage'
    }, {
        order: 2,
        duration: 3,
        descr: 'The final step'
    }]
}, {
    name: 'Roasting peanuts in oven',
    active: true,
    audioBetweenStages: true,
    stages: [{
        order: 0,
        duration: 30,
        descr: 'Heat an oven'
    }, {
        order: 1,
        duration: 300,
        descr: 'Roast firstly'
    }, {
        order: 2,
        duration: 10,
        descr: 'Stir it up'
    }, {
        order: 3,
        duration: 300,
        descr: 'Roast secondly'
    }, {
        order: 4,
        duration: 10,
        descr: 'Stir it up'
    }, {
        order: 5,
        duration: 300,
        descr: 'Final roasting'
    }, {
        order: 6,
        duration: 300,
        descr: 'Let it ripen with the oven turned off'
    }]
}, {
	name: 'Cooking tomato soup with tinned chickpeas',
    active: true,
    audioBetweenStages: true,
	stages: [{
		order: 0,
		duration: 120,
		descr: 'Frying turmeric alongside diced onion'
	}, {
		order: 1,
		duration: 600,
		descr: 'Stewing squashed tomatoes with the onion'
	}, {
		order: 2,
		duration: 1200,
		descr: 'Add hot water and pasta, boil the mix-up'
	}, {
		order: 3,
		duration: 180,
		descr: 'Add tinned chickpeas and carry on boiling'
	}, {
		order: 4,
		duration: 300,
		descr: 'Turn off the cooker and let the meal calm down'
    }]
}].sort((a, b) => a.name > b.name);

module.exports = defaultPrograms;