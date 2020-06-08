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
    delay: number,
    endDelay: number,
    duration: number,
    easing: string,
    autoPlay: boolean
}

type ITarget = string | HTMLElement | (string | HTMLElement)[]
type Options = AnimationOpts &{
    target: ITarget, 
    [animationKey: string]: any 
}
type animationType = 'css' | 'attribute' | 'transform' | 'object'
type Ivalue = number | number[] | string | string[]

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
    transformCache: { [k: string]: any },
    easing: (t: number) => number,
    tweens: ITween[]
}

const defaultAnimationOpts = {
    delay: 0,
    endDelay: 0,
    easing: 'sin',
    duration: 1000,
    autoPlay: true
}

// 是否为动画属性
function isAnimationKey(k: string): boolean {
    return k !== 'target' && !defaultAnimationOpts.hasOwnProperty(k) 
}

function parseEasing(n: string) {
    return easings[n || 'sin']
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

class Axi {
    private options: Options

    private animationOpts: AnimationOpts
    private hooks: Function[] // func of hooks

    private targets: HTMLElement[] // targets of animation
    private animationKeys: string[]
    private animations: IAnimation[]

    private startTime: number
    private paused: boolean

    constructor(opts: Options) {
        this.options = opts
        this.setAnimationOpts(opts) 
        this.setAnimationEles()
        this.setAnimationKeys(opts)
        this.createAnimations()

        if (opts.autoPlay) this.execute()
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
    }

    private createAnimations() {
        const animations: IAnimation[] = [].concat(
            ...this.targets.map(target => {
                const transformCache = getTransforms(target)
                return this.animationKeys.map(prop => {
                    const {
                        delay,
                        endDelay,
                        easing
                    } = this.animationOpts
                    const type = getAnimationType(target, prop)
                    const tweens = this.parseTweens( target, type, prop, this.options[ prop ] )
                    
                    return {
                        target,
                        prop,
                        tweens,
                        delay,
                        endDelay,
                        type,
                        transformCache,
                        easing: parseEasing(easing),
                    }
                })
            })
        )
        this.animations = animations
    }

    private parseTweens(target: HTMLElement, type: string, prop: string, value: Ivalue/* value of tweens */) {
        const {
            delay,
            endDelay,
            duration,
        } = this.animationOpts
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

    public execute() { // 执行动画
        requestAnimationFrame(this.animationStep.bind(this))
    }

    private animationStep(t: number) {
        if (this.startTime === void 0) this.startTime = t
        const progressT = t - this.startTime
        this.animations.forEach(item => {
            const tween = item.tweens.filter(d => progressT < d.end)[0]
            if (!tween) return
            const eased = item.easing(minMax(progressT - tween.start - tween.delay, 0, tween.duration) / tween.duration)
            const newVal = (tween.to.number - tween.from.number) * eased + tween.from.number
            setProgressValue[item.type](item.target, item.prop, tween.to.unit ? newVal + tween.to.unit : newVal, item.type === 'transform' ? item.transformCache : null)
        })
        this.checkEnding(progressT)
        if (!this.paused) requestAnimationFrame(this.animationStep.bind(this))
    }

    private checkEnding(t: number) {
        const {
            delay,
            endDelay,
            duration
        } = this.animationOpts
        if (t >= delay + endDelay + duration) this.paused = true
    }
}

export default Axi