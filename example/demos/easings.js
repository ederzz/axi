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

function renderLines() {
    return easingNames.map((_, i) => `
        <div class="line small line-${ i }">
            <div class="box small"></div>
        </div>
    `).join('')
}

const pennerFuncsCode = `const easingNames = [
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

easingNames.forEach((easing, i) => {
    var box = ' .box:not(.shadow)'
    new Axi({
        target: '.penner-funcs' + \` .line-\${ i }\` + box,
        translateX: 250,
        direction: 'alternate',
        loop: true,
        delay: 200,
        endDelay: 200,
        duration: 2000,
        easing: easing
    })
})
`

let pennerFuncsAxi

addDemos(
    { id: 'easings', title: 'EASINGS', color: 'orange' },
    [
        { 
            id: 'pennerFuncs',
            cls: 'penner-funcs', 
            code: pennerFuncsCode, 
            title: 'PENNER\'S FUNCTIONS', 
            renderLines,
            click() {
                if (pennerFuncsAxi) {
                    resetRunningDemo(pennerFuncsAxi)
                    pennerFuncsAxi.forEach(d => d.restart())
                    return
                }

                pennerFuncsAxi = easingNames.map((easing, i) => {
                    var box = ' .box:not(.shadow)'
                    return new Axi({
                        target: '.penner-funcs' + ` .line-${ i }` + box,
                        translateX: 250,
                        direction: 'alternate',
                        loop: true,
                        delay: 200,
                        endDelay: 200,
                        duration: 2000,
                        easing: easing
                    })
                })
                resetRunningDemo(pennerFuncsAxi)
            }
        }
    ]
)
