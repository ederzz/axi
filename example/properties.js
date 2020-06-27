const cssTransformsCode = `new Axi({
    target: '.css-transforms' + box,
    translateX: 250,
    scale: 2,
    rotate: '1turn'
})
`

var box = ' .box:not(.shadow)'
let cssTransformsAxi

addDemos(
    { id: 'properties', title: 'PROPERTIES', color: 'orange' },
    [
        { 
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
        }
    ]
)
