addDemos(
    { id: 'propertyParams', title: 'PROPERTY-PARAMS', color: 'darkyellow' },
    [
        { 
            id: 'duration', 
            cls: 'duration', 
            title: 'DURATION', 
            linePh: [ '3000ms' ],
            count: 1,
            axiParams: [{
                targets: '.duration .sprite',
                translateX: 250,
                duration: 3000
            }]
        },
        { 
            id: 'delay', 
            cls: 'delay', 
            title: 'DELAY', 
            linePh: [ '1000s' ],
            count: 1,
            axiParams: [{
                targets: '.delay .sprite',
                translateX: 250,
                delay: 1000
            }]
        },
        { 
            id: 'endDelay', 
            cls: 'end-delay', 
            title: 'END DELAY', 
            linePh: [ '1000s' ],
            count: 1,
            axiParams: [{
                targets: '.end-delay .sprite',
                translateX: 250,
                endDelay: 1000,
                direction: 'alternate'
            }]
        },
        { 
            id: 'specPropParams', 
            cls: 'spec-prop-params', 
            title: 'SPECIFIC PROPERTY PARAMETERS', 
            count: 1,
            axiParams: [{
                targets: '.spec-prop-params .sprite',
                translateX: {
                    value: 250,
                    duration: 800
                },
                rotate: {
                    value: 360,
                    duration: 1800,
                    easing: 'easeInOutSine'
                },
                scale: {
                    value: 2,
                    duration: 1600,
                    delay: 800,
                    easing: 'easeInOutQuart'
                },
                delay: 250
            }]
        },
        { 
            id: 'functionBasedParams', 
            cls: 'function-base-params', 
            title: 'FUNCTION BASED PARAMS',
            linePh: [ 'delay = 0 * 100', 'delay = 1 * 100', 'delay = 2 * 100' ],
            count: 3,
            size: 'small',
            axiParams: [{
                targets: '.function-base-params .sprite',
                translateX: 270,
                direction: 'alternate',
                loop: true,
                delay: function(_, i) {
                    return i * 100
                },
                endDelay: function(el, i, l) {
                    return (l - i) * 100
                }
            }]
        },
    ]
)
