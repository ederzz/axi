import easings from './ease'
import { parseUnit, getCssValue, updateObjectProps, minMax } from './utils'

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
    type: string,
    delay: number, 
    endDelay: number,
    prop: string, 
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

const setProgressValue = { 
    css: (t: any, p: string, v: any) => { t.style[p] = v },
    attribute: (t: HTMLElement, p: string, v: any) => { t.setAttribute(p, v) },
    object: (t: any, p: any, v: any) => { t[p] = v; },
    transform: (t: any, p: any, v: any, transforms: any, manual: any) => {
    //   transforms.list.set(p, v)
    //   if (p === transforms.last || manual) {
    //     var str = '';
    //     transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
    //     t.style.transform = str;
    //   }
    }
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

// TODO: 整理要变更的属性数组，每一个元素都包含属性名，和一个缓动数组。
// TODO: 获取所有的目标元素，整理为一个对象,{ target: html元素， transforms: 已有的属性 }
// TODO: 分析有几个缓动，然后每个元素都应该执行这些缓动
// TODO: 最后生成要执行的动画对象，
// TODO: 最后创建出一个实例
// TODO: 所有的缓动参数
// TODO: 所有可以更新的属性
// TODO: 要执行的所有动画
// TODO: getHooks
// TODO: 处理查找元素 setAnimationEles
// TODO: 命名
// TODO: 工具函数抽离
// TODO: 设置动画阶段值
// TODO: 整理tween的属性
// TODO: 整理其他的参数 keyframes svg ...
// TODO: 添加注释和ts类型
// TODO: requestAnimationFrame中访问不到 this
// TODO: autoplay默认参数
// TODO: 多个tween，怎么定义
// TODO: 颜色值特殊处理
// TODO: 解析单位和数字
// TODO: endDelay的作用


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

    private getAnimationType(): animationType {
        return 'css'
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
                return this.animationKeys.map(prop => {
                    const {
                        delay,
                        endDelay,
                        easing
                    } = this.animationOpts
                    const tweens = this.parseTweens( target, prop, this.options[ prop ] )
                    
                    return {
                        target,
                        prop,
                        tweens,
                        delay,
                        endDelay,
                        easing: parseEasing(easing),
                        type: 'css',
                    }
                })
            })
        )
        this.animations = animations
    }

    private parseTweens(target: HTMLElement, prop: string, value: Ivalue/* value of tweens */) {
        const {
            delay,
            endDelay,
            duration,
        } = this.animationOpts
        const oriValue = this.getTargetOriValue(target, prop)
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

    // get original value of target property.
    private getTargetOriValue(ele: HTMLElement, prop: string) {
        // TODO: 根据不同类型获取不同的原始值
        return getCssValue(ele, prop)
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
            setProgressValue['css'](item.target, item.prop, newVal + tween.to.unit)
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