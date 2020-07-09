const random = (a, b) => a + Math.random() * (b - a)

addDemos(
    { id: 'values', title: 'VALUES', color: 'green' }, 
    [
        { 
            id: 'function-based-values', 
            cls: 'function-based-values', 
            title: 'FUNCTION BASED VALUES', 
            count: 3,
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
                    borderRadius: function() { return ['50%', random(10, 35) + '%'] },
                    duration: function() { return random(1200, 1800) },
                    delay: function() { return random(0, 400) },
                    direction: 'alternate',
                    loop: true
                }
            ]
        },
    ]
)
