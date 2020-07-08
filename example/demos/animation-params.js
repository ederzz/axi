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

let loopAxi, loopInfinityAxi, loopReverseAxi, loopReverseInfinityAxi, loopAlternateAxi, loopAlternateInfinityAxi

addDemos(
    { id: 'animationParams', title: 'ANIMATION-PARAMETERS', color: 'yellow' },
    [
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
                    resetRunningDemo([ loopAxi, loopInfinityAxi, loopReverseAxi, loopReverseInfinityAxi, loopAlternateAxi, l ])
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
        { 
            id: 'loop', 
            code: directionCode, 
            cls: 'loop-wrapper',
            spriteCls: [ 'loop', 'loop-reverse', 'loop-alternate', 'loop-infinity', 'loop-reverse-infinity', 'loop-alternate-infinity' ], 
            linePh: [ 'normal 3 times', 'reverse 3 times', 'alternate 3 times', 'loop inifinite', 'reverse inifinite', 'alternate inifinite' ],
            title: 'LOOP', 
            count: 6,
            click() {
                if (directionNormalAxi) {
                    resetRunningDemo([ loopAxi, loopInfinityAxi, loopReverseAxi, loopReverseInfinityAxi, loopAlternateAxi, loopAlternateInfinityAxi ])
                    loopAxi.restart()
                    loopInfinityAxi.restart() 
                    loopReverseAxi.restart() 
                    loopReverseInfinityAxi.restart() 
                    loopAlternateAxi.restart()
                    loopAlternateInfinityAxi.restart()
                    return
                }

                loopAxi = new Axi({
                    target: '.loop',
                    translateX: 270,
                    loop: 3,
                    easing: 'easeInOutSine'
                  });
                  
                loopInfinityAxi = new Axi({
                    target: '.loop-infinity',
                    translateX: 270,
                    loop: true,
                    easing: 'easeInOutSine'
                })
                  
                loopReverseAxi = new Axi({
                    target: '.loop-reverse',
                    translateX: 270,
                    loop: 3,
                    direction: 'reverse',
                    easing: 'easeInOutSine'
                })
                  
                loopReverseInfinityAxi = new Axi({
                    target: '.loop-reverse-infinity',
                    translateX: 270,
                    direction: 'reverse',
                    loop: true,
                    easing: 'easeInOutSine'
                })
                  
                loopAlternateAxi = new Axi({
                    target: '.loop-alternate',
                    translateX: 270,
                    loop: 3,
                    direction: 'alternate',
                    easing: 'easeInOutSine'
                })
                  
                loopAlternateInfinityAxi = new Axi({
                    target: '.loop-alternate-infinity',
                    translateX: 270,
                    direction: 'alternate',
                    loop: true,
                    easing: 'easeInOutSine'
                })

                resetRunningDemo([ loopAxi, loopInfinityAxi, loopReverseAxi, loopReverseInfinityAxi, loopAlternateAxi, loopAlternateInfinityAxi ])
            }
        },
    ]
)
