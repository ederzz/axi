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

let targetsAxi
let nodeListAxi

addDemos(
    { id: 'targets', title: 'TARGETS', color: 'red' }, 
    [
        { 
            id: 'cssSelector', 
            code: cssSelectorCode, 
            cls: 'css-selector', 
            title: 'CSS SELECTOR', 
            count: 1,
            click() {
                if (targetsAxi) {
                    resetRunningDemo(targetsAxi)
                    targetsAxi.restart()
                    return
                }

                targetsAxi = new Axi({
                    target: '.css-selector' + box,
                    translateX: 250
                })
                resetRunningDemo(targetsAxi)
            }
        },
        { 
            id: 'nodeList', 
            cls: 'nodelist', 
            code: nodeListCode, 
            title: 'DOM NODE / NODELIST', 
            count: 3,
            click() {
                if (nodeListAxi) {
                    resetRunningDemo(nodeListAxi)
                    nodeListAxi.restart()
                    return
                }

                nodeListAxi = new Axi({
                    target: '.nodelist' + box,
                    translateX: 250
                })
                resetRunningDemo(nodeListAxi)
            }
        }
    ]
)
