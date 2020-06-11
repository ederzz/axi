addSectionTitle('TARGETS')

addDemos([
    { cls: 'css-selector', title: 'CSS SELECTOR', count: 1 },
    { cls: 'nodelist', title: 'DOM NODE / NODELIST', count: 3 }
])

var box = ' .box:not(.shadow)'
new Axi({
    target: '.css-selector' + box,
    translateX: 250
})
new Axi({
    target: '.nodelist' + box,
    translateX: 250
})