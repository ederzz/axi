var demos = [
    newAxiDemoEl({ cls: 'spec-prop-params', title: 'SPECIFIC PROPERTY PARAMETERS', count: 1 }),
]
demos.forEach(el => {
    body.appendChild(el)
})

var box = ' .box:not(.shadow)'
new Axi({
    target: '.spec-prop-params' + box,
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
})
