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

class Axi {
    private targets: HTMLElement[] // animation targets
    private animations: any[] // 


    constructor(opts: Options) {
        const targets = this.getAnimationEles(opts)
        const tweenOpts = this.getTweenOpts(opts)
        const animationKeys = this.getAnimationKeys(opts)
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
        return document.querySelector(target) // 未找到目标元素处理
    }

    private getTweenOpts(opts: Options): TweenOpts {
        return {} as TweenOpts
    }
}
