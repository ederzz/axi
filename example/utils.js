const body = document.querySelector('body')

function newAxiDemoEl({ cls, title, count, renderLines, click = () => {} }) {
    const div = document.createElement('div')
    div.addEventListener('click', click)
    div.classList.add('demo')
    div.classList.add(cls)
    const content = `
        <h2>${ title }</h2>
        <div class="animations">
            ${
                renderLines
                    ? renderLines()
                    : (new Array(count)).fill(1).map(() => `
                        <div class="line">
                            <div class="box shadow"></div>
                            <div class="box"></div>
                        </div>
                    `).join('')
            }
        </div> 
    `
    div.innerHTML = content
    return div
}

function addSectionTitle(txt) {
    const title = document.createElement('div')
    title.innerHTML = txt
    body.appendChild(title)
}

function addDemos(optsAry) {
    optsAry.forEach(opts => {
        const el = newAxiDemoEl(opts)
        body.appendChild(el)
    })
}