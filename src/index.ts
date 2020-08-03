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
    getAttribute,
    getTotalLength,
    selectMotionPathNode,
    isDom,
    isCor,
    color2rgba,
    rgbaGen,
    requestAnimFrame,
    cancelRequestAnimFrame
} from './utils'

type NumberGenerator = (el: any, idx: number, len: number) => number
type StrGenerator = (el: any, idx: number, len: number) => string

type Easing = string | StrGenerator
type Delay = number | NumberGenerator
type Duration = number | NumberGenerator
type Direction = 'alternate' | 'reverse' | 'normal'

interface TweenConfig {
    delay?: Delay,
    endDelay?: Delay,
    duration?: Duration,
    easing?: Easing
}
type TweenOriVal = number | string
type TweenVal = TweenOriVal | TweenOriVal[]
type TweenObj = { value: TweenVal } & TweenConfig
type AnimationVal = TweenVal | TweenObj | TweenObj[]
type AnimationValGenerator = (node: HTMLElement, idx: number, len: number) => TweenVal

interface AnimationConfig {
    delay: Delay,
    endDelay: Delay,
    duration: Duration,
    easing: Easing,
    direction: Direction,
    autoPlay: boolean,
    round: boolean,
    loop: boolean,
}

interface IHooks {
    axiStart: () => void,
    axiEnd: () => void,
    loopStart: () => void,
    loopEnd: () => void,
    updateStart: () => void,
    updateEnd: () => void,
}

type Target = string | HTMLElement | (string | HTMLElement)[]

type Options = Partial<AnimationConfig> & Partial<IHooks> & {
    target: Target
} & {
    [animationKey: string]: AnimationValGenerator | AnimationVal | PathTweenVal
}

type animationType = 'css' | 'attribute' | 'transform' | 'object'

interface TweenValue {
    number: number,
    unit: string,
    value: number | string
}

interface ITween { 
    start: number,
    end: number,
    delay: number,
    endDelay: number,
    duration: number,
    value: AnimationVal | AnimationValGenerator | PathTweenVal,
    from: TweenValue,
    to: TweenValue,
    easing: any,
    isPath: boolean,
    isColor: boolean
}

interface IAnimation {
    target: HTMLElement[],
    type: animationType,
    prop: string, 
    round: boolean,
    transformCache: { [k: string]: any },
    tweens: ITween[]
}

type FunctionValArgs = [ HTMLElement, number, number ] 

function getParentSvg(el: SVGElement) {
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
    direction: 'normal',
    round: false
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
    return k !== 'target' && !defaultAnimationOpts.hasOwnProperty(k) && !defaultHooks.hasOwnProperty(k)
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

function decomposeValue(val: PathTweenVal | AnimationVal, unit: string) {
    const reg = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
    const matchRet = ((isPathVal(val) ? val.totalLength : val) + '').match(reg)

    return {
        original: val,
        number: matchRet ? +matchRet[0] : 0,
        unit
    }
}

function decomposeCorValue(cor: string) {
    const original = color2rgba(cor)
    const rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g

    return {
        original,
        number: original.match(rgx).map(Number),
        unit: ''
    }
}

function getPoint(el: SVGPathElement, curLen: number) {
    return el.getPointAtLength(curLen >= 1 ? curLen : 0)
}

function getPathProgressVal(value: PathTweenVal, progress: number) {
    const { prop, el, svg, totalLength } = value
    const len = totalLength * progress
    const current = getPoint( el, len )
    const prev = getPoint( el, len - 1 )
    const next = getPoint( el, len + 1 )
    switch (prop) {
        case 'x': return current.x - svg.x
        case 'y': return current.y - svg.y
        case 'angle': return Math.atan2(next.y - prev.y, next.x - prev.x) * 180 / Math.PI
    }
}

function getSvgInfo(el: SVGElement) {
    const svg = getParentSvg(el)
    const { width, height } = svg.getBoundingClientRect()
    const viewBoxAttr = getAttribute(svg, 'viewBox')
    const viewBox = viewBoxAttr && viewBoxAttr.split(' ').map(n => +n) || [ 0, 0, width, height ]

    return {
        el: svg,
        x: viewBox[0],
        y: viewBox[1],
        xScale: width / viewBox[2], 
        yScale: height / viewBox[3],
    }
}

function composeCorNewVal(from: number[], to: number[], eased: number) {
    let ret = []
    for (let i = 0; i < from.length; i++) {
        ret.push((to[i] - from[i]) * eased + from[i] as any)
    }
    return rgbaGen(ret[0], ret[1], ret[2], ret[3])
}

function getFunctionVal(d: any, args: FunctionValArgs) {
    if (typeof d === 'function') {
        return d( ...args )
    }
    return d ?? void 0
}

// Axi = animation + ... + animation
// animation = tween + ... + tween

class Axi { 
    private options: Options

    private animationOpts: AnimationConfig
    private hooks: IHooks // func of hooks

    private targets: HTMLElement[] // targets of animation
    private animationKeys: string[]
    private animations: IAnimation[]

    private startTime: number
    private curTime: number = 0
    private lastTime: number = 0 // record progress at pause.

    private duration: number = 0 // delay + endDelay + duration : duration of Axi
    private paused: boolean = true
    private reversed: boolean = false // reversed direction

    private rafId: number
    private restLoopCount: number
    private isPausedByBrowserHidden: boolean = false
    public axiStarted = false
    public axiEnded = false

    constructor(opts: Options) {
        this.options = opts
        this.setAnimationOpts(opts) 
        this.setReversed()
        this.setRestLoopCount()
        this.setHooks(opts) 
        this.setAnimationEles()
        this.setAnimationKeys(opts)
        this.createAnimations()
        this.registerVisibilityEvent()
        this.getTotalDuration()

        if (this.animationOpts.autoPlay) {
            this.newLoop()
            this.execute()
            this.paused = false
        }
    }

    private getTotalDuration() {
        this.duration = Math.max( ...this.animations.map(d => {
            return d.tweens.reduce((t, d) => {
                return t + d.delay + d.duration + d.endDelay
            }, 0)
        }))
    }

    private registerVisibilityEvent() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !this.paused) {
                this.isPausedByBrowserHidden = true
                this.pause()
            } 
            if (!document.hidden && this.isPausedByBrowserHidden) {
                this.isPausedByBrowserHidden = false
                this.play()
            }
        })
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

    private setReversed() {
        const {
            direction,
        } = this.animationOpts
        this.reversed = direction === 'reverse'
    }

    private setRestLoopCount() {
        const {
            direction,
            loop
        } = this.animationOpts
        if (typeof loop === 'number') this.restLoopCount = loop
        else this.restLoopCount = loop ? -1 : ( direction === 'alternate' ? 2 : 1 )
    }
    
    private setHooks(opts: Options) {
        this.hooks = updateObjectProps(defaultHooks, opts)
    }

    private createAnimations() {
        const animations: IAnimation[] = [].concat(
            ...this.targets.map( this.createAnimationsOfEl.bind(this) )
        )
        this.animations = animations
    }
    
    private createAnimationsOfEl(target: HTMLElement, idx: number, ary: HTMLElement[]) {
        const transformCache = isDom(target) ? getTransforms(target) : {}
        const functionValArgs: FunctionValArgs = [target, idx, ary.length]

        const {
            delay,
            endDelay,
            easing,
            duration,
            round
        } = this.animationOpts
        const curDelay = getFunctionVal( delay, functionValArgs )
        const curEndDelay = getFunctionVal( endDelay, functionValArgs )
        const curEasing = getFunctionVal( easing, functionValArgs )
        const curDuration = getFunctionVal( duration, functionValArgs )

        return this.animationKeys.map(prop => {
            const type = getAnimationType(target, prop)
            const defaultOpts = { // default opts of tweens
                delay: curDelay,
                endDelay: curEndDelay,
                duration: curDuration,
                easing: curEasing,
            }
            const tweens = this.createTweensOfAnimation( defaultOpts, type, prop, functionValArgs )
            
            return {
                target,
                tweens,
                type,
                round,
                prop,
                transformCache,
            }
        })
    }

    private createTweensOfAnimation(
        defaultOpts: any,
        type: string, 
        prop: string,
        functionValArgs: FunctionValArgs
    ) {
        const vals = this.parsePropVal(prop, functionValArgs)

        let oriValue = getTargetOriValue(type, functionValArgs[ 0 ], prop)
        let oriUnit = parseUnit(oriValue)

        const len = vals.length
        const durationPiece = defaultOpts.duration / len

        let prevEndTime = 0
        let previousVal: number | string
        return vals.map((_: any, i: number) => {
            const current = vals[ i ]

            let {
                delay,
                endDelay,
                duration = durationPiece,
                easing = defaultOpts.easing
            } = current

            const toVal = Array.isArray(current.value) ? current.value[1] : current.value
            const fromVal = Array.isArray(current.value) ? current.value[0] : previousVal ?? oriValue
            previousVal = toVal

            if (i === 0 && delay === void 0) {
                delay = defaultOpts.delay
            }
            if (i === vals.length && endDelay === void 0) {
                endDelay = defaultOpts.endDelay
            }

            delay = delay ?? 0
            endDelay = endDelay ?? 0

            const isColor = isCor(toVal as string)

            let from, to
            if (isColor) {
                from = decomposeCorValue(fromVal as string)
                to = decomposeCorValue(toVal as string) 
            } else {
                from = decomposeValue(fromVal, parseUnit(fromVal) || oriUnit)
                to = decomposeValue(toVal, parseUnit(toVal) || oriUnit)
            }

            const start = prevEndTime
            const end = start + delay + endDelay + duration
            prevEndTime = end
            const isPath = isPathVal(this.options[ prop ])

            return {
                value: this.options[ prop ],
                easing: parseEasing(easing),
                start,
                end,
                duration,
                isPath,
                isColor,
                delay,
                endDelay,
                from,
                to
            }
        })
    }

    private parsePropVal(prop: string, functionValArgs: FunctionValArgs) { 
        let propVal: any = getFunctionVal( this.options[prop], functionValArgs )

        if (Array.isArray(propVal)) {
            if (propVal.length === 2 && typeof propVal[0] !== 'object') {
                propVal = { value: propVal }
            }
        }

        propVal = Array.isArray( propVal ) ? propVal : [ propVal ]

        return propVal.map((d: TweenObj) => ({
            ...( typeof d === 'object' ? d : { value: d } ),
            delay: getFunctionVal(d.delay, functionValArgs),
            endDelay: getFunctionVal(d.endDelay, functionValArgs),
            duration: getFunctionVal(d.duration, functionValArgs),
            easing: getFunctionVal(d.easing, functionValArgs),
        }))
    }

    private execute() { // 执行动画
        this.rafId = requestAnimFrame(this.animationStep.bind(this))
    }

    private animationStep(t: number) {
        const progressT = this.calcProgressT(t)
        this.hooks.updateStart() // hook: start of every update.
        this.execAnimations(progressT)
        this.hooks.updateEnd() // hook: end of every update.
        this.checkEnding(progressT)
        if (!this.paused) {
            this.execute()
        }
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
            const tweenProgressT = minMax(progressT - tween.delay - tween.start, 0, tween.duration)
            const tweenProgress = tweenProgressT / tween.duration
            const eased = tween.easing( tweenProgress )

            let newVal
            if (tween.isColor) newVal = composeCorNewVal(tween.from.number as any, tween.to.number as any, eased)
            else if (tween.isPath) newVal = getPathProgressVal(tween.value as PathTweenVal, eased)
            else newVal = (tween.to.number - tween.from.number) * eased + tween.from.number
            if (item.round && !tween.isColor) newVal = Math.round(newVal as number)
            if (tween.to.unit) newVal = newVal + tween.to.unit

            const transforms = item.type === 'transform' ? item.transformCache : null
            setProgressValue[item.type](item.target, item.prop, newVal, transforms)
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
        cancelRequestAnimFrame(this.rafId)
        
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
        this.setReversed()
        this.setRestLoopCount()
        this.paused = false
        this.lastTime = 0

        this.axiStarted = false
        this.axiEnded = false
        
        this.newLoop()
        this.execute()
    }

    public seek(p: number) { 
        let progressT = p * this.duration
        this.execAnimations(progressT)
    }

    public newLoop() {
        if (this.restLoopCount > 0) this.restLoopCount--
        if (!this.axiStarted) { // hook: start of axi.
            this.axiStarted = true
            this.axiEnded = false
            this.hooks.axiStart()
        }
        this.hooks.loopStart() // hook: start of loop
        this.lastTime = 0
        this.startTime = 0
        this.curTime = 0
        // this.execute()
    }

    public reverse() {
        this.reversed = !this.reversed
        this.restart()
    }

    // get path of animation
    static getMotionPath(el: string | SVGPathElement) {
        const path: SVGElement = selectMotionPathNode(el)
         
        return (prop: string) => ({
            prop,
            el: path,
            svg: getSvgInfo(path),
            totalLength: getTotalLength(path)
        } as PathTweenVal)
    }
}

export default Axi