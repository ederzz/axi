import easings from './ease'
import { 
    parseUnit, 
    updateObjectProps, 
    minMax, 
    getAnimationType,
    setProgressValue,
    getTargetOriValue,
    getTransforms
} from './utils'

interface AnimationOpts {
    delay: IDelay,
    endDelay: IDelay,
    duration: number,
    easing: string,
    autoPlay: boolean,
    loop: boolean,
    direction: IDirection
}

type Options = Partial<AnimationOpts> &{
    target: ITarget, 
    [animationKey: string]: any 
}

type DelayFunc = (el: any, idx: number, len: number) => number
type IDelay = number | DelayFunc
type ITarget = string | HTMLElement | (string | HTMLElement)[]
type animationType = 'css' | 'attribute' | 'transform' | 'object'
type Ivalue = number | number[] | string | string[] 
type IDirection = 'alternate' | 'reverse' | 'normal'

interface TweenValue {
    number: number,
    unit: string,
    value: number | string
}

interface ITween { 
    start: number,
    end: number,
    delay: number,
    duration: number,
    value: number | string,
    from: TweenValue,
    to: TweenValue,
}

interface IAnimation {
    target: HTMLElement[],
    type: animationType,
    delay: number, 
    endDelay: number,
    prop: string, 
    duration: number,
    value: Ivalue,
    transformCache: { [k: string]: any },
    easing: (t: number) => number,
    tweens: ITween[]
}

const defaultAnimationOpts = {
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    duration: 1000,
    autoPlay: true,
    loop: false,
    direction: 'normal'
}

// 是否为动画属性
function isAnimationKey(k: string): boolean {
    return k !== 'target' && !defaultAnimationOpts.hasOwnProperty(k) 
}

function parseEasing(n: string) {
    const easingName = n.split('(')[0]
    const ease = easings[ easingName ]
    const match = /\(([^)]+)\)/.exec(n)
    const params = match ? match[1].split(',').map(parseFloat) : [];

    return ease.apply(null, params)
}

function decomposeValue(val: Ivalue | number, unit: string) {
    var reg = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
    const matchRet = (val + '').match(reg)

    return {
        original: val,
        number: matchRet ? +matchRet[0] : 0,
        unit
    }
}

// TODO: 所有的缓动参数
// TODO: 所有可以更新的属性
// TODO: 要执行的所有动画
// TODO: getHooks
// TODO: 处理查找元素 setAnimationEles
// TODO: 命名
// TODO: 整理tween的属性
// TODO: 整理其他的参数 keyframes svg ...
// TODO: 添加注释和ts类型
// TODO: 颜色值特殊处理
// TODO: 解析单位和数字
// TODO: endDelay的作用
// TODO: 缓动函数调整
// TODO: 多段式动画
// TODO: 对比测试
// TODO: 性能测试
// TODO: transform 处理不到位
// TODO: 测试object
// TODO: tween start delay 
// TODO: 离开页面后恢复
// TODO: 提供vue/react使用

// hooks: update begin complete loopbegin loopcomplete change changeBegin chanageComplete finished

// Axi = animation + ... + animation
// animation = tween + ... + tween

class Axi { 
    private options: Options

    private animationOpts: AnimationOpts
    private hooks: Function[] // func of hooks

    private targets: HTMLElement[] // targets of animation
    private animationKeys: string[]
    private animations: IAnimation[]

    private startTime: number
    private curTime: number = 0
    private lastTime: number = 0

    private duration: number = 0 // delay + endDelay + duration : duration of Axi
    private paused: boolean = true
    private reversed: boolean = false // reversed direction

    private rafId: number

    constructor(opts: Options) {
        this.options = opts
        this.setAnimationOpts(opts) 
        this.setAnimationEles()
        this.setAnimationKeys(opts)
        this.createAnimations()
        this.duration = Math.max(...this.animations.map(d => d.duration)) 
            + Math.max(...this.animations.map(d => d.delay)) 
            + Math.max(...this.animations.map(d => d.endDelay))

        if (this.animationOpts.autoPlay) {
            this.paused = false
            this.execute()
        }
    }

    private setAnimationKeys(opts: Options) {
        const keys: string[] = []
        for (const k in opts) {
            if (isAnimationKey(k)) keys.push(k)
        }
        this.animationKeys = keys
    }

    private setAnimationEles() { // 获取更新元素
        let { target } = this.options
        target = Array.isArray(target) ? target : [ target ]
        this.targets = [].concat(
            ...target.map(d => { 
                if (typeof d === 'string') return (Array as any).from(document.querySelectorAll(d))
                return d
            })
        )
    }

    private setAnimationOpts(opts: Options) { // set animation options
        this.animationOpts = updateObjectProps(defaultAnimationOpts, opts)
        this.reversed = this.animationOpts.direction === 'reverse'
    }

    private createAnimations() {
        const animations: IAnimation[] = [].concat(
            ...this.targets.map((target, idx, ary) => {
                const transformCache = getTransforms(target)
                const {
                    delay,
                    endDelay,
                    easing
                } = this.animationOpts
                const curDelay = typeof delay === 'number' ? delay : delay(target, idx, ary.length)
                const curEndDelay = typeof endDelay === 'number' ? endDelay : endDelay(target, idx, ary.length)

                return this.animationKeys.map(prop => {
                    const type = getAnimationType(target, prop)
                    let opts = { // options of every animation.
                        prop,
                        easing,
                        delay: curDelay,
                        endDelay: curEndDelay,
                        duration: this.animationOpts.duration,
                        value: this.options[ prop ] /* value of tweens */
                    }
                    const propValue = this.options[ prop ]
                    if (typeof propValue === 'object') {
                        opts = updateObjectProps(opts, propValue)
                    }
                    opts.easing = parseEasing(opts.easing)
                    const tweens = this.parseTweens( target, type, opts )
                    
                    return {
                        target,
                        tweens,
                        type,
                        transformCache,
                        ...opts
                    }
                })
            })
        )
        this.animations = animations
    }

    private parseTweens(target: HTMLElement, type: string, opts: { value: Ivalue, prop: string, delay: number, endDelay: number, easing: string, duration: number }) {
        const {
            prop,
            delay,
            endDelay,
            value,
            duration
        } = opts
        const oriValue = getTargetOriValue(type, target, prop)
        const oriUnit = parseUnit(oriValue)
        const vals = Array.isArray(value) ? (value as string[] | number[]) : [ value ]
        const len = vals.length
        const durationPiece = duration / len

        return (vals as string[]).map((d: string, i: number) => {
            const fromVal = i === 0 ? oriValue : vals[ i - 1 ]
            const from = decomposeValue(fromVal, parseUnit(fromVal) || oriUnit)
            const toVal = vals[i]
            const to = decomposeValue(toVal, parseUnit(toVal) || oriUnit)
            return {
                start: (i === 0 ? delay : 0) + durationPiece * i,
                end: delay + durationPiece * (i + 1) + (i === len - 1 ? endDelay : 0),
                duration: durationPiece,
                value: d,
                delay,
                from,
                to
            }
        })
    }

    private execute() { // 执行动画
        this.rafId = requestAnimationFrame(this.animationStep.bind(this))
    }

    private animationStep(t: number) {
        const progressT = this.calcProgressT(t)
        this.execAnimations(progressT)
        this.checkEnding(progressT)
        if (!this.paused) this.execute()
    }

    private calcProgressT(t: number) {
        if (!this.startTime) this.startTime = t
        const progressT = t - this.startTime + this.lastTime
        this.curTime = progressT // record current progress time
        return this.reversed ? this.duration - progressT : progressT
    }

    private execAnimations(progressT: number) {
        this.animations.forEach(item => {
            const tween = item.tweens.filter(d => progressT <= d.end)[0]
            if (!tween) return
            const eased = item.easing(minMax(progressT - tween.delay, 0, tween.duration) / tween.duration)
            const newVal = (tween.to.number - tween.from.number) * eased + tween.from.number
            setProgressValue[item.type](item.target, item.prop, tween.to.unit ? newVal + tween.to.unit : newVal, item.type === 'transform' ? item.transformCache : null)
        })
    }

    private checkEnding(t: number) {
        const isEnd = this.reversed ? t <= 0 : t >= this.duration
        if (isEnd) {
            if (this.animationOpts.direction === 'alternate') {
                this.reversed = !this.reversed
            }
            if (this.animationOpts.loop) {
                this.restart()
            } else {
                this.paused = true
            }
        }
    }

    // ===== control ======
    public pause() {
        if (this.paused) return
        cancelAnimationFrame(this.rafId)
        this.paused = true
        this.startTime = 0
        this.lastTime = this.curTime
    }

    public play() {
        if (!this.paused) return
        this.paused = false
        this.execute()
    }

    public restart() {
        this.paused = false
        this.startTime = 0
        this.curTime = 0
        this.execute()
    }

    public seek(p: number) {
        const progressT = p * this.duration
        this.execAnimations(this.reversed ? this.duration - progressT : progressT)
    }

    public reverse() {
        this.reversed = !this.reversed
        this.restart()
    }
}

export default Axi