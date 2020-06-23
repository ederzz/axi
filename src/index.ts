import easings from './ease'
import { 
    parseUnit, 
    updateObjectProps, 
    minMax, 
    getAnimationType,
    setProgressValue,
    getTargetOriValue,
    getTransforms,
    isObj,
    isSvg,
    getAttribute
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

interface IHooks {
    axiStart: () => void,
    axiEnd: () => void,
    loopStart: () => void,
    loopEnd: () => void,
    updateStart: () => void,
    updateEnd: () => void,
}

type Options = Partial<AnimationOpts> & Partial<IHooks> & {
    target: ITarget, 
    [animationKey: string]: any 
}

type DelayFunc = (el: any, idx: number, len: number) => number
type IDelay = number | DelayFunc
type ITarget = string | HTMLElement | (string | HTMLElement)[]
type animationType = 'css' | 'attribute' | 'transform' | 'object'
type Ivalue = number | number[] | string | string[] | PathTweenVal | PathTweenVal[] // TODO: path object
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
    value: number | string | PathTweenVal,
    from: TweenValue,
    to: TweenValue,
    isPath: boolean
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
// TODO: 
function getParentSvg(el: SVGPathElement) {
    let parent = el.parentNode
    while (!isSvg(parent)) {
        parent = parent.parentNode
    }
    return parent
}

interface SvgInfo {
    el: SVGElement,
    xScale: number,
    yScale: number,
    x: number,
    y: number,
}

interface PathTweenVal {
    prop: string,
    el: SVGPathElement,
    svg: SvgInfo,
    totalLength: number
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

const defaultHooks = {
    axiStart: () => {},
    axiEnd: () => {},
    loopStart: () => {},
    loopEnd: () => {},
    updateStart: () => {},
    updateEnd: () => {}
}

// 是否为动画属性
function isAnimationKey(k: string): boolean {
    return k !== 'target' && !defaultAnimationOpts.hasOwnProperty(k) 
}

function isPathVal(val: any): val is PathTweenVal  {
    return isObj(val) && val.hasOwnProperty('totalLength')
}

function parseEasing(n: string) {
    const easingName = n.split('(')[0]
    const ease = easings[ easingName ]
    const match = /\(([^)]+)\)/.exec(n)
    const params = match ? match[1].split(',').map(parseFloat) : [];

    return ease.apply(null, params)
}

function decomposeValue(val: Ivalue, unit: string) {
    const reg = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
    const matchRet = ((isPathVal(val) ? val.totalLength : val) + '').match(reg)

    return {
        original: val,
        number: matchRet ? +matchRet[0] : 0,
        unit
    }
}

function getPoint(el: SVGPathElement, curLen: number) {
    return el.getPointAtLength(curLen >= 1 ? curLen : 0)
}

function getPathProgressVal(value: PathTweenVal, progress: number) {
    const { prop, el, svg, totalLength } = value
    const len = totalLength * progress // TODO: round
    const current = getPoint( el, len )
    const prev = getPoint( el, len - 1 )
    const next = getPoint( el, len + 1 )
    switch (prop) {
        case 'x': return current.x - svg.x
        case 'y': return current.y - svg.y
        case 'angle': return Math.atan2(next.y - prev.y, next.x - prev.x) * 180 / Math.PI // TODO: math
    }
}

function getSvgInfo(el: SVGPathElement) {
    const svg = getParentSvg(el)
    const { width, height } = svg.getBoundingClientRect()
    const viewBoxAttr = getAttribute(svg, 'viewBox')
    const viewBox = (svg as any).viewBox || ( viewBoxAttr && viewBoxAttr.split(' ') || [ 0, 0, width, height ] )

    return {
        el: svg,
        x: viewBox[0],
        y: viewBox[1],
        xScale: width / viewBox[2], // 0 value TODO:
        yScale: height / viewBox[3],
    }
}

// TODO: 所有的缓动参数
// TODO: 所有可以更新的属性
// TODO: 要执行的所有动画
// TODO: getHooks
// TODO: 处理查找元素 setAnimationEles
// TODO: 命名
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
// TODO: 验证私有属性
// TODO: loop hook 有问题
// TODO: 添加progress属性
// TODO: 变更值的类型 svgpath等类型

// progress 是否有可能小于100
// progress 反向
// change应该是单趟
// loop可能是正反两趟

// Axi = animation + ... + animation
// animation = tween + ... + tween

class Axi { 
    private options: Options

    private animationOpts: AnimationOpts
    private hooks: IHooks // func of hooks

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
    private restLoopCount: number
    public axiStarted = false
    public axiEnded = false

    constructor(opts: Options) {
        this.options = opts
        this.setAnimationOpts(opts) 
        this.setHooks(opts) 
        this.setAnimationEles()
        this.setAnimationKeys(opts)
        this.createAnimations()
        this.duration = Math.max(...this.animations.map(d => d.duration)) 
            + Math.max(...this.animations.map(d => d.delay)) 
            + Math.max(...this.animations.map(d => d.endDelay))

        if (this.animationOpts.autoPlay) this.newLoop()
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
        const {
            direction,
            loop
        } = this.animationOpts
        this.reversed = direction === 'reverse'
        this.restLoopCount = loop ? -1 : ( direction === 'alternate' ? 2 : 1 )
    }
    
    private setHooks(opts: Options) {
        this.hooks = updateObjectProps(defaultHooks, opts)
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
        const vals = Array.isArray(value) ? value : [ value ]
        const len = vals.length
        const durationPiece = duration / len

        return (vals as string[]).map((d: Ivalue, i: number) => {
            const fromVal = i === 0 ? oriValue : vals[ i - 1 ]
            const from = decomposeValue(fromVal, parseUnit(fromVal) || oriUnit)
            const toVal = vals[i]
            const to = decomposeValue(toVal, parseUnit(toVal) || oriUnit)
            return {
                start: (i === 0 ? delay : 0) + durationPiece * i,
                end: delay + durationPiece * (i + 1) + (i === len - 1 ? endDelay : 0),
                duration: durationPiece,
                value: d,
                isPath: isPathVal(d),
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
        this.hooks.updateStart() // hook: start of every update.
        this.execAnimations(progressT)
        this.hooks.updateEnd() // hook: end of every update.
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
            let newVal
            if (tween.isPath) newVal = getPathProgressVal(tween.value as PathTweenVal, eased)
            else newVal = (tween.to.number - tween.from.number) * eased + tween.from.number
            setProgressValue[item.type](item.target, item.prop, tween.to.unit ? newVal + tween.to.unit : newVal, item.type === 'transform' ? item.transformCache : null)
        })
    }

    private checkEnding(t: number) {
        const isEnd = this.reversed ? t <= 0 : t >= this.duration

        if (isEnd) {
            this.hooks.loopEnd() // hook: end of loop
            if (this.animationOpts.direction === 'alternate') {
                this.reversed = !this.reversed
            }
            if (this.restLoopCount > 0 || this.restLoopCount === -1) {
                this.newLoop()
            } else { // hook: end of axi
                this.paused = true
                this.axiEnded = true
                this.hooks.axiEnd()
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

        this.axiStarted = true
        this.axiEnded = false
        this.hooks.axiStart()
        
        this.execute()
    }

    public seek(p: number) { // seek会触发生命周期吗 TODO:
        const progressT = p * this.duration
        this.execAnimations(this.reversed ? this.duration - progressT : progressT)
    }

    public newLoop() {
        if (this.restLoopCount > 0) this.restLoopCount--
        if (!this.axiStarted) { // hook: start of axi.
            this.axiStarted = true
            this.axiEnded = false
            this.hooks.axiStart()
        }
        this.hooks.loopStart() // hook: start of loop
        this.startTime = 0
        this.curTime = 0
        this.execute()
    }

    public reverse() {
        this.reversed = !this.reversed
        this.restart()
    }

    // get path of animation
    // TODO: type
    public getAxiPath(el: string | SVGPathElement) {
        const path: SVGPathElement = typeof el === 'string' ? document.querySelector(el) : el
        return (prop: string) => ({
            prop,
            el: path,
            svg: getSvgInfo(path),
            totalLength: path.getTotalLength() // TODO: 兼容其他元素和比例
        } as PathTweenVal)
    }
}

export default Axi