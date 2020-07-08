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

const functionBasedParamsCode = `new Axi({
    target: '.function-base-params' + box,
    translateX: 270,
    direction: 'alternate',
    loop: true,
    delay: function(_, i) {
        return i * 100
    },
    endDelay: function(el, i, l) {
        return (l - i) * 100
    }
}`

var box = ' .box:not(.shadow)'
let specPropParamsAxi
let functionBasedParamsAxi

addDemos(
    { id: 'propertyParams', title: 'PROPERTY-PARAMS', color: 'darkyellow' },
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
        },
        { 
            id: 'functionBasedParams', 
            code: functionBasedParamsCode, 
            cls: 'function-base-params', 
            title: 'FUNCTION BASED PARAMS',
            linePh: [ 'delay = 0 * 100', 'delay = 1 * 100', 'delay = 2 * 100' ],
            count: 3,
            click() {
                if (functionBasedParamsAxi) {
                    resetRunningDemo(functionBasedParamsAxi)
                    functionBasedParamsAxi.restart()
                    return
                }

                functionBasedParamsAxi = new Axi({
                    target: '.function-base-params' + box,
                    translateX: 270,
                    direction: 'alternate',
                    loop: true,
                    delay: function(_, i) {
                        return i * 100
                    },
                    endDelay: function(el, i, l) {
                        return (l - i) * 100
                    }
                })
                resetRunningDemo(functionBasedParamsAxi)
            }
        },
    ]
)
