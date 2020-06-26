// http://robertpenner.com/easing/
// https://easings.net/
import { minMax } from './utils'

interface IEases {
    [k: string]: EasingGenerator
}

type Easing = (t: number) => number
type EasingGenerator = (a?: number, b?: number) => Easing

const c1 = 1.70158
const c3 = c1 + 1

// t: [0, 1] 
const eases: IEases = {
    Sine: () => (t: number) => 1 - Math.cos(t * Math.PI / 2), // 正弦曲线缓动
    Circle: () => (t: number) => 1 - Math.sqrt(1 - t * t), // 圆形曲线缓动
    Back: () => (t: number) => c3 * (t ** 3) - c1 * t * t,  
    Bounce: () => (t: number) => { // 小球落地
        let pow2, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {}
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2)
    }, 
    Quad: () => (t: number) => t ** 2, // 2次方缓动
    Cubic: () => (t: number) => t ** 3, // 三次方缓动
    Quart: () => (t: number) => t ** 4, // 4次方缓动
    Quint: () => (t: number) => t ** 5, // 5次方缓动
    Expo: () => (t: number) => t = 0 ? 0 : 2 ** (10 * ( t - 1 )), // 指数缓动
    Elastic: (amplitude: number | undefined, period: number | undefined) => { // 弹簧动画
        if ( amplitude === void 0 ) amplitude = 1
        if ( period === void 0 ) period = .5
    
        let a = minMax(amplitude, 1, 10);
        let p = minMax(period, .1, 2);
        return (t: number) => {
          return (t === 0 || t === 1) 
            ? t 
            : -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p)
        }
    }
}

const easings: IEases = {
    linear: () => (t: number) => t
}

for (const n in eases) {
    const easeIn = eases[ n ]
    easings[ 'easeIn' + n ] = easeIn
    easings[ 'easeOut' + n ] = (a: number, b: number) => (t: number) => 1 - easeIn(a, b)(1 - t), // easeout = 1 - easein(1 - t)
    easings[ 'easeInOut' + n ] = (a: number, b: number) => (t: number) => t < 0.5 
        ? easeIn(a, b)(t * 2) / 2 
        : 1 - easeIn(a, b)(t * -2 + 2) / 2
}

export default easings
