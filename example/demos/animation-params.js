addDemos(
    { id: 'animationParams', title: 'ANIMATION-PARAMETERS', color: 'yellow' },
    [
        { 
            id: 'direction', 
            cls: 'direction',
            spriteCls: [ 'direction-normal', 'direction-reverse', 'direction-alternate' ], 
            linePh: [ 'normal', 'reverse', 'alternate' ],
            title: 'DIRECTION', 
            count: 3,
            axiParams: [{
                targets: '.direction-normal',
                translateX: 250,
                easing: 'easeInOutSine'
            }, {
                targets: '.direction-reverse',
                translateX: 250,
                direction: 'reverse',
                easing: 'easeInOutSine'
            }, {
                targets: '.direction-alternate',
                translateX: 250,
                direction: 'alternate',
                easing: 'easeInOutSine'
            }]
        },
        { 
            id: 'loop', 
            cls: 'loop-wrapper',
            spriteCls: [ 'loop', 'loop-reverse', 'loop-alternate', 'loop-infinity', 'loop-reverse-infinity', 'loop-alternate-infinity' ], 
            linePh: [ 'normal 3 times', 'reverse 3 times', 'alternate 3 times', 'loop inifinite', 'reverse inifinite', 'alternate inifinite' ],
            title: 'LOOP', 
            size: 'small',
            count: 6,
            axiParams: [{
                targets: '.loop',
                translateX: 270,
                loop: 3,
                easing: 'easeInOutSine'
            }, {
                targets: '.loop-infinity',
                translateX: 270,
                loop: true,
                easing: 'easeInOutSine'
            }, {
                targets: '.loop-reverse',
                translateX: 270,
                loop: 3,
                direction: 'reverse',
                easing: 'easeInOutSine'
            }, {
                targets: '.loop-reverse-infinity',
                translateX: 270,
                direction: 'reverse',
                loop: true,
                easing: 'easeInOutSine'
            }, {
                targets: '.loop-alternate',
                translateX: 270,
                loop: 3,
                direction: 'alternate',
                easing: 'easeInOutSine'
            }, {
                targets: '.loop-alternate-infinity',
                translateX: 270,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            }]
        },
        { 
            id: 'autoPlay', 
            cls: 'auto-play',
            spriteCls: [ 'autoplay-true', 'autoplay-false' ], 
            linePh: [ 'autoplay: true', 'autoplay: false' ],
            title: 'AUTOPLAY', 
            count: 2,
            axiParams: [{
                targets: '.autoplay-true',
                translateX: 250,
                autoPlay: true,
                easing: 'easeInOutSine'
            }, {
                targets: '.autoplay-false',
                translateX: 250,
                autoPlay: false,
                easing: 'easeInOutSine'
            }]
        },
    ]
)
