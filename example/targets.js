const body = document.querySelector('body')
var demos = [
    newAxiDemoEl({ cls: 'css-selector', title: 'CSS SELECTOR', count: 1 }),
    newAxiDemoEl({ cls: 'nodelist', title: 'DOM NODE / NODELIST', count: 3 }),
]
demos.forEach(el => {
    body.appendChild(el)
})

var box = ' .box:not(.shadow)'
new Axi({
    target: '.css-selector' + box,
    translateX: 250
})
new Axi({
    target: '.nodelist' + box,
    translateX: 250
})