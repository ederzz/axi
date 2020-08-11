const easingNames = [
    'easeInQuad',
    'easeInCubic',
    'easeInQuart',
    'easeInQuint',
    'easeInSine',
    'easeInExpo',
    'easeInCircle',
    'easeInBack',
    'easeInBounce',
    'easeInOutQuad',
    'easeInOutCubic',
    'easeInOutQuart',
    'easeInOutQuint',
    'easeInOutSine',
    'easeInOutExpo',
    'easeInOutCircle',
    'easeInOutBack',
    'easeInOutBounce',
    'easeOutQuad',
    'easeOutCubic',
    'easeOutQuart',
    'easeOutQuint',
    'easeOutSine',
    'easeOutExpo',
    'easeOutCircle',
    'easeOutBack',
    'easeOutBounce'
]

addDemos(
    { id: 'easings', title: 'EASINGS', color: 'lightpurple' },
    [
        { 
            id: 'pennerFuncs',
            cls: 'penner-funcs strip', 
            title: 'PENNER\'S FUNCTIONS', 
            spriteCls: easingNames,
            count: easingNames.length,
            axiParams: easingNames.map(easing => ({
                targets: '.' + easing,
                translateX: 250,
                direction: 'alternate',
                loop: true,
                delay: 200,
                endDelay: 200,
                duration: 2000,
                easing: easing
            }))
        },
        { 
            id: 'cubic-bezier',
            cls: 'cubic-bezier', 
            title: 'CUBIC BÉZIER CURVE', 
            axiParams: [{
                targets: '.cubic-bezier .sprite',
                translateX: 250,
                direction: 'alternate',
                loop: true,
                easing: 'cubicBezier(.5, .05, .1, .3)'
            }]
        },
    ]
)
