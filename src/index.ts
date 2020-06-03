import easings from './ease'

interface AnimationOpts {
    delay: number,
    endDelay: number,
}

interface TweenOpts {
    easing: string,
    duration: number, // 持续时间
}

type Options = TweenOpts & AnimationOpts &{
    target: string | HTMLElement | (string | HTMLElement)[], 
    autoPlay: boolean,
    [animationKey: string]: any // 动画属性
}

type animationType = 'css' | 'attribute' | 'transform' | 'object'

interface ITween { 
    value: any,
    from: number,
    to: number,
    easing: (t: number) => number
}

interface IAnimation {
    target: HTMLElement[],
    type: string,
    delay: number, 
    endDelay: number,
    prop: string, 
    tweens: ITween[]
}

const defaultAnimationOpts = {
    delay: 0,
    endDelay: 0,
}

const defaultTweenOpts = {
    easing: 'sin',
    duration: 1000,
}

// 是否为动画属性
function isAnimationKey(k: string): boolean {
    return k !== 'target' && !defaultTweenOpts.hasOwnProperty(k) && !defaultAnimationOpts.hasOwnProperty(k) && k !== 'target' && k !== 'autoPlay'
}

function updateObjectProps(o1: any, o2: any) {
    const cloneObj = { ...o1 }
    for (const k in o1) {
        cloneObj[ k ] = o2.hasOwnProperty(k) ? o2[k] : o1[k]
    }

    return cloneObj
}

var setProgressValue = { 
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

// TODO:
function getCssValue(ele: HTMLElement, prop: string) {
    if (prop in ele.style) {
        const val = ele.style[prop as any] || getComputedStyle(ele).getPropertyValue(prop) || '0'
        return +val.slice(0, -2)
    }
    return 0
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
// TODO: 处理查找元素 getAnimationEles
// TODO: 命名
// TODO: 工具函数抽离
// TODO: 设置动画阶段值
// TODO: 整理tween的属性
// TODO: 整理其他的参数 keyframes svg ...
// TODO: 添加注释和ts类型
// TODO: requestAnimationFrame中访问不到 this
// TODO: autoplay默认参数
// normalizeTweens TODO: 结束 开始值 from的值为元素本来值，或者上一个tween的结果


class Axi {
    private options: Options

    private animationOpts: AnimationOpts
    private tweenOpts: TweenOpts
    private hooks: Function[] // 钩子函数

    private targets: HTMLElement[] // animation targets
    private animationKeys: string[]
    private animations: IAnimation[]

    private startTime: number

    constructor(opts: Options) {
        this.options = opts
        this.getAnimationEles()
        this.formatOpts(opts) // 动画参数
        this.getAnimationKeys(opts)
        this.createAnimations()
        if (opts.autoPlay) this.execute()
    }

    private getAnimationKeys(opts: Options) {
        const keys: string[] = []
        for (const k in opts) {
            if (isAnimationKey(k)) keys.push(k)
        }
        this.animationKeys = keys
    }

    private getAnimationType(): animationType {
        return 'css'
    }

    private getAnimationEles() { // 获取更新元素
        let { target } = this.options
        target = Array.isArray(target) ? target : [ target ]
        this.targets = [].concat(
            ...target.map(d => { 
                if (typeof d === 'string') return (Array as any).from(document.querySelectorAll(d))
                return d
            })
        )
    }

    private formatOpts(opts: Options) {
        this.animationOpts = updateObjectProps(defaultAnimationOpts, opts)
        this.tweenOpts = updateObjectProps(defaultTweenOpts, opts)
    }

    private createAnimations() {
        const animations: IAnimation[] = [].concat(
            ...this.targets.map(target => {
                return this.animationKeys.map(prop => ({
                    target,
                    prop,
                    ...this.animationOpts,
                    tweens: [{
                        value: this.options[prop],
                        to: this.options[prop],
                        from: getCssValue(target, prop),
                        easing: parseEasing(this.tweenOpts.easing)
                    }]
                }))
            })
        )
        this.animations = animations
    }

    public execute() { // 执行动画
        requestAnimationFrame(this.animationStep.bind(this))
    }

    private animationStep(t: number) {
        if (this.startTime === void 0) this.startTime = t
        const progressT = t - this.startTime
        this.animations.forEach(item => {
            const tween = item.tweens[0]
            const eased = tween.easing(progressT / 1000)
            const newVal = (tween.to - tween.from) * eased + tween.from
            console.log(newVal, '新值')
            setProgressValue['css'](item.target, item.prop, newVal)
        })
        if (progressT < 1000) requestAnimationFrame(this.animationStep.bind(this))
    }
}

export default Axi