const directionCode = `
new Axi({
    target: 'direction-normal',
    translateX: 250,
    easing: 'easeInOutSine'
})
new Axi({
    target: 'direction-reverse',
    translateX: 250,
    direction: 'reverse',
    easing: 'easeInOutSine'
})
new Axi({
    target: 'direction-alternate',
    translateX: 250,
    direction: 'alternate',
    easing: 'easeInOutSine'
})
`

var box = ' .box:not(.shadow)'
let directionNormalAxi
let directionReverseAxi
let directionAlternateAxi

addDemos(
    { id: 'animationParams', title: 'ANIMATION-PARAMETERS', color: 'darkyellow' },
    [ // TODO: bug
        { 
            id: 'direction', 
            code: directionCode, 
            cls: 'direction',
            spriteCls: [ 'direction-normal', 'direction-reverse', 'direction-alternate' ], 
            linePh: [ 'normal', 'reverse', 'alternate' ],
            title: 'DIRECTION', 
            count: 3,
            click() {
                if (directionNormalAxi) {
                    resetRunningDemo([ directionNormalAxi, directionReverseAxi, directionAlternateAxi ])
                    directionNormalAxi.restart()
                    directionReverseAxi.restart()
                    directionAlternateAxi.restart()
                    return
                }

                directionNormalAxi = new Axi({
                    target: '.direction-normal',
                    translateX: 250,
                    easing: 'easeInOutSine'
                })
                directionReverseAxi = new Axi({
                    target: '.direction-reverse',
                    translateX: 250,
                    direction: 'reverse',
                    easing: 'easeInOutSine'
                })
                directionAlternateAxi = new Axi({
                    target: '.direction-alternate',
                    translateX: 250,
                    direction: 'alternate',
                    easing: 'easeInOutSine'
                })
                resetRunningDemo([ directionNormalAxi, directionReverseAxi, directionAlternateAxi ])
            }
        },
    ]
)

// TODO: loop 支持数字