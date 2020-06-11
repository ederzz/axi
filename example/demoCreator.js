function newAxiDemoEl({ cls, title, count }) {
    const div = document.createElement('div')
    div.classList.add('demo')
    div.classList.add(cls)
    const content = `
        <h2>${ title }</h2>
        <div class="animations">
            ${
                (new Array(count)).fill(1).map(() => `
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