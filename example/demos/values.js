const random = (a, b) => a + Math.random() * (b - a)

addDemos(
    { id: 'values', title: 'VALUES', color: 'green' }, 
    [
        { 
            id: 'function-based-values', 
            cls: 'function-based-values', 
            title: 'FUNCTION BASED VALUES', 
            count: 3,
            shape: 'circle',
            size: 'small',
            axiParams: [
                {
                    target: '.function-based-values .sprite',
                    translateX: function(_, i) {
                        return [170, 80, 270][i]
                    },
                    translateY: function(_, i) {
                        return 50 + (-50 * i)
                    },
                    scale: function(_, i, l) {
                        return (l - i) + .25
                    },
                    rotate: function() { return random(-360, 360) },
                    borderRadius: function () { return random(10, 35) + '%' },
                    duration: function() { return random(1200, 1800) },
                    delay: function() { return random(0, 400) },
                    direction: 'alternate',
                    loop: true
                }
            ]
        },
        { 
            id: 'relative', 
            cls: 'relative', 
            title: 'FUNCTION BASED VALUES', 
            shape: 'circle',
            axiParams: [
                {
                    target: '.relative .sprite',
                    translateX: {
                        value: 250,
                        duration: 1000
                    },
                    width: {
                        value: 8,
                        duration: 1800,
                        easing: 'easeInOutSine'
                    },
                    rotate: {
                        value: '2turn',
                        duration: 1800,
                        easing: 'easeInOutSine'
                    },
                    direction: 'alternate'
                }
            ]
        },
        { 
            id: 'colors', 
            cls: 'colors', 
            title: 'COLORS', 
            count: 5,
            shape: 'circle',
            size: 'small',
            spriteCls: [ 'color-hex', 'color-rgb', 'color-hsl', 'color-rgba', 'color-hsla' ],
            axiParams: [
                {
                    target: '.color-hex',  
                    translateX: 270,
                    background: '#FFF',
                    easing: 'easeInOutQuad',
                    loop: true,
                    direction: 'alternate',
                    duration: 2000,
                },
                {
                    target: '.color-rgb',  
                    translateX: 270,
                    duration: 2000,
                    easing: 'easeInOutQuad',
                    loop: true,
                    direction: 'alternate',
                    background: 'rgb(255,255,255)'
                },
                {
                    target: '.color-hsl',  
                    duration: 2000,
                    easing: 'easeInOutQuad',
                    loop: true,
                    translateX: 270,
                    direction: 'alternate',
                    background: 'hsl(0, 100%, 100%)'
                },
                {
                    duration: 2000,
                    easing: 'easeInOutQuad',
                    loop: true,
                    target: '.color-rgba',  
                    translateX: 270,
                    direction: 'alternate',
                    background: 'rgba(255,255,255, .2)'
                },
                {
                    duration: 2000,
                    easing: 'easeInOutQuad',
                    loop: true,
                    target: '.color-hsla',  
                    translateX: 270,
                    direction: 'alternate',
                    background: 'hsla(0, 100%, 100%, .2)'
                },
            ]
        },
    ]
)
