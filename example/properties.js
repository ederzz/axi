addSectionTitle('PROPERTIES')

addDemos([
    { cls: 'css-transforms', title: 'CSS TRANSFORMS', count: 1 }
])

var box = ' .box:not(.shadow)'
new Axi({
    target: '.css-transforms' + box,
    translateX: 250,
    scale: 2,
    rotate: '1turn'
})
