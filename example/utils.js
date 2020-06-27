const body = document.querySelector('body')

function addNavLinks(links) {
    links.forEach((d, i) => {
        const navlinkDiv = document.createElement('div')
        const navlink = document.createElement('a')
        navlink.href = '#' + d.id
        navlink.innerText = d.title
        if (i > 0) navlinkDiv.classList.add('sub-link')
        navlinkDiv.appendChild(navlink)
        navSection.appendChild(navlinkDiv)
    })
}

function newAxiDemo({ id, code, cls, click = () => {}, title, count, renderLines, color, extra }) {
    const div = document.createElement('div')
    div.id = id
    div.addEventListener('click', () => {
        click()
        renderCodeExp({
            id,
            code
        })
        demoTitle.innerHTML = title
        demoTitle.className = 'demo-title ' + color
    })

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
                            <div style="opacity: .2;" class="${ color } box shadow"></div>
                            <div class="${ color } box"></div>
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
    demoSection.appendChild(div)
}

function renderCodeExp({ id, code }) {
    const codeWrapper = document.createElement('div')
    const codeCls = `${id}-code-exp`
    codeWrapper.classList.add(codeCls)
    const preEl = document.createElement('pre')
    const codeEl = document.createElement('code')
    codeEl.innerText = code
    codeWrapper.appendChild(preEl)
    preEl.appendChild(codeEl)
    hljs.highlightBlock(codeEl)

    codeExpSection.innerHTML = ''
    codeExpSection.appendChild(codeWrapper)
}

function addDemos(cate, optsAry) {
    addNavLinks([
        cate,
        ...optsAry.map(d => ({
            id: d.id,
            title: d.title
        }))
    ])
    optsAry.forEach(opts => {
        newAxiDemo({ ...opts, color: cate.color || 'red' })
    })
}