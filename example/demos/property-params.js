const specPropParamsCode = `
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
`

var box = ' .box:not(.shadow)'
let specPropParamsAxi

addDemos(
    { id: 'propertyParams', title: 'PROPERTY-PARAMS', color: 'yellow' },
    [
        { 
            id: 'specPropParams', 
            code: specPropParamsCode, 
            cls: 'spec-prop-params', 
            title: 'SPECIFIC PROPERTY PARAMETERS', 
            count: 1,
            click() {
                if (specPropParamsAxi) {
                    resetRunningDemo(specPropParamsAxi)
                    specPropParamsAxi.restart()
                    return
                }

                specPropParamsAxi = new Axi({
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
                resetRunningDemo(specPropParamsAxi)
            }
        }
    ]
)
