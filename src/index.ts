import easings from './ease'

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

interface ITween { 
    from: number, // TODO:
    to: number,
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

function updateObjectProps(o1: any, o2: any) {
    const cloneObj = { ...o1 }
    for (const k in o1) {
        cloneObj[ k ] = o2.hasOwnProperty(k) ? o2[k] : o1[k]
    }

    return cloneObj
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
// TODO: 处理查找元素 setAnimationEles
// TODO: 命名
// TODO: 工具函数抽离
// TODO: 设置动画阶段值
// TODO: 整理tween的属性
// TODO: 整理其他的参数 keyframes svg ...
// TODO: 添加注释和ts类型
// TODO: requestAnimationFrame中访问不到 this
// TODO: autoplay默认参数
// normalizeTweens TODO: 结束 开始值 from的值为元素本来值，或者上一个tween的结果
// TODO: 多个tween，怎么定义
// 假设分为多个值，就有多个缓动，每个缓动均分duration，设置启动和结束时间
// TODO: 颜色值特殊处理
// TODO: easing指定多个值 delay endDelay处理


class Axi {
    private options: Options

    private animationOpts: AnimationOpts
    private hooks: Function[] // func of hooks

    private targets: HTMLElement[] // targets of animation
    private animationKeys: string[]
    private animations: IAnimation[]

    private startTime: number

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
                return this.animationKeys.map(prop => ({
                    target,
                    prop,
                    type: 'css',
                    dealy: this.animationOpts.delay,
                    endDelay: this.animationOpts.endDelay,
                    easing: parseEasing(this.animationOpts.easing),
                    tweens: [{ // TODO: 多个tween和from to 的属性，value的作用
                        to: this.options[prop],
                        from: getCssValue(target, prop),
                        
                    }]
                }))
            })
        )
        this.animations = animations
    }

    public execute() { // 执行动画
        requestAnimationFrame(this.animationStep.bind(this))
    }

    private animationStep(t: number) { // TODO: 什么时候结束，暂停等控制
        if (this.startTime === void 0) this.startTime = t
        const progressT = t - this.startTime
        this.animations.forEach(item => {
            const tween = item.tweens[0]
            const eased = item.easing(progressT / 1000)
            const newVal = (tween.to - tween.from) * eased + tween.from
            setProgressValue['css'](item.target, item.prop, newVal + 'px')
        })
        if (progressT < 1000) requestAnimationFrame(this.animationStep.bind(this))
    }
}

export default Axi