addDemos(
    { id: 'targets', title: 'TARGETS', color: 'red' }, 
    [
        { 
            id: 'cssSelector', 
            cls: 'css-selector', 
            title: 'CSS SELECTOR', 
            count: 1,
            axiParams: [
                {
                    target: '.css-selector .sprite',
                    translateX: 250
                }
            ]
        },
        { 
            id: 'nodeList', 
            cls: 'nodelist', 
            title: 'DOM NODE / NODELIST', 
            size: 'small',
            count: 3,
            axiParams: [
                {
                    target: '.nodelist .sprite',
                    translateX: 250
                }
            ]
        }
    ]
)
