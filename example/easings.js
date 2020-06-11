addSectionTitle('EASINGS')

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

addDemos([
    { cls: 'penner-funcs', title: 'PENNER\'S FUNCTIONS', renderLines }
])

easingNames.forEach((easing, i) => {
    var box = ' .box:not(.shadow)'
    new Axi({
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

