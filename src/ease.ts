// http://robertpenner.com/easing/

interface IEases {
    [k: string]: (t: number) => number
}

// TODO: elastic, bounce ease function
const overshoot = 1.70158
// t: [0, 1] 
export const easeIns: IEases = {
    back: t => t * t * ((overshoot + 1) * t - overshoot), // https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation#Anticipation
    sin: t => Math.sin(t * Math.PI / 2), // 正弦曲线缓动
    circle: t => Math.sqrt(1 - t * t), // 圆形曲线缓动
    elastic: t => 100 ** t * Math.sin(8.5 * Math.PI * t) / 100, 
    bounce: t => {
        let pow2, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { };
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2)
    }, 
    quad: t => t ** 2, // 2次方缓动
    cubic: t => t ** 3, // 三次方缓动
    quart: t => t ** 4, // 4次方缓动
    quint: t => t ** 5, // 5次方缓动
    expo: t => 2 ** (10 * ( t - 1 )) // 指数缓动
}

export const easeOuts: IEases = {}
export const easeInOuts: IEases = {}

for (const ease in easeIns) {
    easeOuts[ ease ] = t => 1 - easeIns[ease](1 - t) // easeout = 1 - easein(1 - t)
    easeInOuts[ ease ] = t => t < 0.5 ? easeIns[ ease ](t * 2) / 2 : 1 - easeIns[ ease ](2 - 2 * t) / 2
}
