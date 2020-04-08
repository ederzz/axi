interface AnimationOpts {
    target: string, // 动画作用目标
    
    // TODO:
    // keyframes 
    // 剩余动画属性的值
    [animationKey: string]: any // 动画属性
}

interface TweenOpts {
    loop: boolean, // 循环
    easing: string, // 缓动函数
    duration: number, // 持续时间
    delay: number, // 延迟
}

type Options = TweenOpts & AnimationOpts

type animationType = 'css' | 'attribute' | 'transform' | 'object'
// TODO: 更新分为三类：ele.attribute,css,transform,object

interface ITween extends TweenOpts {
    name: string,
    value: any,
}

interface IAnimation { // 一次动画就是要在一个html元素上执行的一组缓动步骤
    target: HTMLElement[],
    tweens: ITween[]
}

const defaultTweenOpts = {
    loop: true,
    easing: '',
    duration: 1000,
    delay: 0
}

// 是否为动画属性
function isAnimationKey(k: string): boolean {
    return k !== 'target' && !defaultTweenOpts.hasOwnProperty(k)
}

function updateObjectProps(o1: any, o2: any) {
    const cloneObj = { ...o1 }
    for (const k in o1) {
        cloneObj[ k ] = o2.hasOwnProperty(k) ? o2[k] : o1[k]
    }

    return cloneObj
}

class Axi {
    private options: Options
    private targets: HTMLElement[] // animation targets
    private animations: IAnimation[]

    constructor(opts: Options) {
        this.options = opts
        this.targets = [ this.getAnimationEles(opts) ]
        const tweenOpts = this.getTweenOpts(opts)
        const animationKeys = this.getAnimationKeys(opts)
        this.setAnimations(animationKeys, tweenOpts)
        // TODO: 所有的缓动参数
        // TODO: 所有可以更新的属性
        // TODO: 要执行的所有动画
    }

    private getAnimationKeys(opts: Options) {
        const keys: string[] = []
        for (const k in opts) {
            if (isAnimationKey) keys.push(k)
        }
        return keys
    }

    private getAnimationType(): animationType {
        return 'css'
    }

    private getAnimationEles({ target }: Options) {
        return document.querySelector(target) as HTMLElement // 未找到目标元素处理
    }

    private getTweenOpts(opts: Options): TweenOpts {
        return updateObjectProps(defaultTweenOpts, opts)
    }

    private setAnimations(animationKeys: string[], tweenOpts: TweenOpts) {
        const animations = this.targets.map(target => ({
            target,
            tweens: animationKeys.map(k => ({
                name: k,
                value: this.options[k],
                ...tweenOpts,
            }))
        }))
        this.animations = animations as any
    }

    public execute() { // 执行动画

    }
}
