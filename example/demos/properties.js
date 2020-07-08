const cssTransformsCode = `new Axi({
    target: '.css-transforms' + box,
    translateX: 250,
    scale: 2,
    rotate: '1turn'
})
`

const cssProperties = `anime({
    targets: '.css-prop-demo .el',
    left: '240px',
    backgroundColor: '#FFF',
    borderRadius: ['0%', '50%'],
    easing: 'easeInOutQuad'
})`

var box = ' .box:not(.shadow)'
let cssTransformsAxi
let cssPropertiesAxi

addDemos(
    { id: 'properties', title: 'PROPERTIES', color: 'orange' },
    [
        { 
            id: 'cssTransforms',
            cls: 'css-transforms', 
            title: 'CSS TRANSFORMS', 
            count: 1, 
            code: cssTransformsCode,
            click() {
                if (cssTransformsAxi) {
                    resetRunningDemo(cssTransformsAxi)
                    cssTransformsAxi.restart()
                    return
                }

                cssTransformsAxi = new Axi({
                    target: '.css-transforms' + box,
                    translateX: 250,
                    scale: 2,
                    rotate: '1turn'
                })
                resetRunningDemo(cssTransformsAxi)
            }
        },
        { 
            id: 'cssProperties',
            cls: 'css-properties', 
            title: 'CSS PROPERTIES', 
            count: 1, 
            code: cssProperties,
            click() {
                if (cssPropertiesAxi) {
                    resetRunningDemo(cssPropertiesAxi)
                    cssPropertiesAxi.restart()
                    return
                }

                cssPropertiesAxi = new Axi({
                    target: '.css-properties' + box,
                    left: '240px',
                    backgroundColor: '#FFF',
                    borderRadius: ['50%'],
                    easing: 'easeInOutQuad'
                })
                resetRunningDemo(cssPropertiesAxi)
            }
        },
    ]
)
