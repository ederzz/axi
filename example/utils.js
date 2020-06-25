const body = document.querySelector('body')

function newAxiDemoEl({ cls, title, count, renderLines, click = () => {}, extra, color = 'rgb(255, 75, 75)' }) {
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
                            <div style="background: ${ color };opacity: .2;" class="box shadow"></div>
                            <div style="background: ${ color };" class="box"></div>
                        </div>
                    `).join('')
            }
        </div> 
    `
    div.innerHTML = content
    if (extra) {
        const extraDiv = document.createElement('div')
        extraDiv.classList.add('extra')
        extraDiv.innerHTML = extra
        div.querySelector('.animations').appendChild(extraDiv)
    }
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