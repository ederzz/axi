addDemos(
    { id: 'properties', title: 'PROPERTIES', color: 'orange' },
    [
        { 
            id: 'cssTransforms',
            cls: 'css-transforms', 
            title: 'CSS TRANSFORMS', 
            count: 1, 
            axiParams: [{
                target: '.css-transforms .sprite',
                translateX: 250,
                scale: 2,
                rotate: '1turn'
            }]
        },
        { 
            id: 'cssProperties',
            cls: 'css-properties', 
            title: 'CSS PROPERTIES', 
            count: 1, 
            axiParams: [{
                target: '.css-properties .sprite',
                left: '240px',
                backgroundColor: '#FFF',
                borderRadius: ['50%'],
                easing: 'easeInOutQuad'
            }]
        },
    ]
)
