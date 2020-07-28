let loopStartCount = 0
let loopEndCount = 0
let updateStartCount = 0
let updateEndCount = 0

addDemos(
    { id: 'hooks', title: 'HOOKS', color: 'orange' },
    [
        { 
            id: 'axiStartEnd',
            cls: 'axi-start-end', 
            title: 'AXI START/END', 
            count: 1, 
            extra: '<div class="start-hook-status">Axi start: false</div><div class="end-hook-status">Axi end: false</div>',
            axiParams: [{
                target: '.axi-start-end .sprite',
                translateX: 250,
                axiStart() {
                    console.log('start a new Axi.')
                    $('.start-hook-status').innerHTML = 'Axi start: true'
                },
                axiEnd() {
                    console.log('Axi end.')
                    $('.end-hook-status').innerHTML = 'Axi end: true'
                },
            }]
        },
        {
            id: 'loopStartEnd',
            cls: 'loop-start-end', 
            title: 'LOOP START/END', 
            count: 1, 
            extra: '<div class="loop-start-status">loop start: 0</div><div class="loop-end-status">loop end: 0</div>',
            axiParams: [{
                target: '.loop-start-end .sprite',
                loop: true,
                direction: 'alternate',
                duration: 8000,
                translateX: 250,
                loopStart() {
                    loopStartCount++
                    $('.loop-start-status').innerHTML = 'loop start: ' + loopStartCount
                },
                loopEnd() {
                    loopEndCount++
                    $('.loop-end-status').innerHTML = 'loop end: ' + loopEndCount
                },
            }]
        },
        { 
            id: 'updateStartEnd',
            cls: 'update-start-end', 
            title: 'UPDATE START/END', 
            count: 1, 
            extra: '<div class="update-start-status">update start: 0</div><div class="update-end-status">update end: 0</div>',
            axiParams: [{
                target: '.update-start-end .sprite',
                translateX: 250,
                updateStart() {
                    updateStartCount++
                    $('.update-start-status').innerHTML = 'update start: ' + updateStartCount
                },
                updateEnd() {
                    updateEndCount++
                    $('.update-end-status').innerHTML = 'update end: ' + updateEndCount
                }
            }]
        },
    ]
)
