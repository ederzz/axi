// http://robertpenner.com/easing/

interface IEases {
    [k: string]: (t: number) => number
}

// TODO: elastic, bounce ease function
const overshoot = 1.70158

// t: [0, 1] 
const eases: IEases = {
    Back: t => t * t * ((overshoot + 1) * t - overshoot), // https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation#Anticipation
    Sin: t => Math.sin(t * Math.PI / 2), // 正弦曲线缓动
    Circle: t => Math.sqrt(1 - t * t), // 圆形曲线缓动
    Elastic: t => 100 ** t * Math.sin(8.5 * Math.PI * t) / 100, // 弹簧
    Bounce: t => { // 小球落地
        let pow2, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { };
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2)
    }, 
    Quad: t => t ** 2, // 2次方缓动
    Cubic: t => t ** 3, // 三次方缓动
    Quart: t => t ** 4, // 4次方缓动
    Quint: t => t ** 5, // 5次方缓动
    Expo: t => 2 ** (10 * ( t - 1 )) // 指数缓动
}

const easings: IEases = {}

for (const n in eases) {
    easings[ 'easeIn' + n ] = eases[ n ]
    easings[ 'easeOut' + n ] = t => 1 - eases[n](1 - t) // easeout = 1 - easein(1 - t)
    easings[ 'easeInOut' + n ] = t => t < 0.5 ? eases[ n ](t * 2) / 2 : 1 - eases[ n ](2 - 2 * t) / 2
}

export default easings