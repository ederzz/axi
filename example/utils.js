const body = document.querySelector('body')

function addNavLinks(links) {
    const {
        id: firstId,
        code: firstDemoCode
    } = links[1]

    const {
        color,
    } = links[0]

    links.forEach((d, i) => {
        const navlinkDiv = document.createElement('div')
        const navlink = document.createElement('a')
        const id = i === 0 ? firstId : d.id
        navlink.href = '#' + id
        navlink.innerText = d.title

        if (i > 0) {
            navlinkDiv.classList = 'link sub-link'
        } else {
            navlinkDiv.classList.add('link')
        }

        let code = d.code
        if (i === 0) code = firstDemoCode

        navlink.addEventListener('click', () => {
            if (activeDemo === id) return
            resetActiveLink(id, firstId, color)
            renderCodeExp({ id, code })
        })
            
        navlinkDiv.appendChild(navlink)
        navSection.appendChild(navlinkDiv)
    })
}

let activeDemo = ''

function resetActiveLink(id, parentId, color) {
    document.querySelectorAll('.link a').forEach(d => {
        d.classList = ''
    })

    const link = document.querySelector(`.sub-link a[href='#${ id }']`)
    link.classList = color
    const cateLink = document.querySelector(`a[href='#${ parentId }']`)
    cateLink.classList = color
}

function newAxiDemo({ 
    id, 
    cate, 
    parentId, 
    code, 
    cls, 
    spriteCls = [], 
    linePh = [], 
    click = () => {}, 
    title, 
    count, 
    renderLines, 
    extra 
}) {
    const {
        color,
        title: cateTitle,
    } = cate

    const div = document.createElement('div')
    div.id = id
    div.addEventListener('click', () => {
        click()

        if (activeDemo === id) return

        activeDemo = id
        demoSection.scrollTop = div.offsetTop - 61
        renderCodeExp({
            id,
            code
        })

        resetActiveLink(id, parentId, color)

        demoTitle.innerHTML = title
        category.innerHTML = cateTitle
        demoTitle.className = 'demo-title ' + color
        category.className = 'category ' + color
    })

    div.classList.add('demo')
    div.classList.add(cls)
    const content = `
        <h2>${ title }</h2>
        <div class="animations">
            ${
                renderLines
                    ? renderLines()
                    : (new Array(count)).fill(1).map((_, i) => `
                        <div class="line">
                            <div style="opacity: .2;" class="${ color } box shadow"></div>
                            <div class="${ color } ${ spriteCls[i] || '' } box"></div>
                            <div style="opacity: .2;margin-left: 35px;line-height: 28px;" class="ph ${ color }">${ linePh[i] || '' }</div>
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
        ...optsAry
    ])
    optsAry.forEach(opts => {
        newAxiDemo({ 
            ...opts, 
            cate, 
            parentId: optsAry[0].id, 
            cateTitle: cate.title, 
            color: cate.color || 'red' 
        })
    })
}