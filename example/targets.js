var box = ' .box:not(.shadow)'
const cssSelectorCode = `new Axi({
    target: '.css-selector' + box,
    translateX: 250
})
`

const nodeListCode = `new Axi({
    target: '.nodelist' + box,
    translateX: 250
})
`

addDemos(
    { id: 'targets', title: 'TARGETS', color: 'red' }, 
    [
        { id: 'cssSelector', code: cssSelectorCode, cls: 'css-selector', title: 'CSS SELECTOR', count: 1 },
        { id: 'nodeList', cls: 'nodelist', code: nodeListCode, title: 'DOM NODE / NODELIST', count: 3 }
    ]
)

eval(cssSelectorCode)
eval(nodeListCode)