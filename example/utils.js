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

function resetActiveLink(id, parentId, color) {
    document.querySelectorAll('.link a').forEach(d => {
        d.classList = ''
    })

    const link = document.querySelector(`.sub-link a[href='#${ id }']`)
    link.classList = color
    const cateLink = document.querySelector(`a[href='#${ parentId }']`)
    cateLink.classList = color
}

function newAxiDemo(opts) {
    const { 
        cate, 
        axiParams = [], 
        extra,
    } = opts
    const {
        color,
        title: cateTitle,
    } = cate

    let axis 
    function runAxi() {
        if (axis) {
            resetRunningDemo(axis)
            axis.forEach(d => d.restart())
            return
        }

        axis = axiParams.map(d => (
            new Axi({
                ...d
            })
        ))
        
        resetRunningDemo(axis)
    }

    const demo = createDemoEl(opts) 
    bindClickEvent(demo, { ...opts, runAxi, color, cateTitle })
    renderLinesOfDemo(demo, { ...opts, color })
    renderExtra(demo, extra)
    pushAxiDemo2list(demo)
}

function createDemoEl({
    id,
    cls
}) {
    const div = document.createElement('div')
    div.id = id
    div.className = 'demo ' + cls
    return div
}

let activeDemo = ''

function bindClickEvent(demo, {
    click,
    runAxi,
    id,
    code,
    axiParams = [],
    color,
    title,
    cateTitle,
    parentId
}) {
    demo.addEventListener('click', () => {
        if (click) click()
        else runAxi()

        if (activeDemo === id) return

        activeDemo = id
        demoSection.scrollTop = demo.offsetTop - 61

        const axiCode  = code || axiParams.map(d => `new Axi(${ JSON.stringify(d, null, 4) })
        `).join('\n')

        renderCodeExp({
            id,
            code: axiCode
        })

        resetActiveLink(id, parentId, color)

        demoTitle.innerHTML = title
        category.innerHTML = cateTitle
        demoTitle.className = 'demo-title ' + color
        category.className = 'category ' + color
    })
}

function renderLinesOfDemo(demo, {
    title,
    size,
    count,
    renderLines,
    color,
    spriteCls = [],
    linePh = [],
}) {
    const content = `
        <h2>${ title }</h2>
        <div class="animations">
            ${
                renderLines
                    ? renderLines()
                    : (new Array(count)).fill(1).map((_, i) => `
                        <div class="line ${ size }">
                            <div style="opacity: .2;" class="${ color } box shadow"></div>
                            <div class="${ color } ${ spriteCls[i] || '' } box sprite"></div>
                            <div style="opacity: .2;margin-left: 35px;line-height: 28px;" class="ph ${ color }">${ linePh[i] || '' }</div>
                        </div>
                    `).join('')
            }
        </div> 
    `
    demo.innerHTML = content
}

function renderExtra(demo, extra) {
    if (extra) {
        const extraDiv = document.createElement('div')
        extraDiv.classList.add('extra')
        extraDiv.innerHTML = extra
        demo.querySelector('.animations').appendChild(extraDiv)
    }
}

function pushAxiDemo2list(d) {
    demoSection.appendChild(d)
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