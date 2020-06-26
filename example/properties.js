const cssTransformsCode = `new Axi({
    target: '.css-transforms' + box,
    translateX: 250,
    scale: 2,
    rotate: '1turn'
})
`

addDemos(
    { id: 'targets', title: 'TARGETS', color: 'orange' },
    [
        { cls: 'css-transforms', title: 'CSS TRANSFORMS', count: 1, code: cssTransformsCode }
    ]
)

var box = ' .box:not(.shadow)'

eval(cssTransformsCode)