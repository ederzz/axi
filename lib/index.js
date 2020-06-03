import easings from './ease.js';
const defaultAnimationOpts = {
    delay: 0,
    endDelay: 0,
};
const defaultTweenOpts = {
    easing: 'sin',
    duration: 1000,
};
function isAnimationKey(k) {
    return k !== 'target' && !defaultTweenOpts.hasOwnProperty(k) && !defaultAnimationOpts.hasOwnProperty(k) && k !== 'target' && k !== 'autoPlay';
}
function updateObjectProps(o1, o2) {
    const cloneObj = Object.assign({}, o1);
    for (const k in o1) {
        cloneObj[k] = o2.hasOwnProperty(k) ? o2[k] : o1[k];
    }
    return cloneObj;
}
var setProgressValue = {
    css: (t, p, v) => { t.style[p] = v; },
    attribute: (t, p, v) => { t.setAttribute(p, v); },
    object: (t, p, v) => { t[p] = v; },
    transform: (t, p, v, transforms, manual) => {
    }
};
function parseEasing(n) {
    return easings[n || 'sin'];
}
function getCssValue(ele, prop) {
    if (prop in ele.style) {
        const val = ele.style[prop] || getComputedStyle(ele).getPropertyValue(prop) || '0';
        return +val.slice(0, -2);
    }
    return 0;
}
class Axi {
    constructor(opts) {
        this.options = opts;
        this.getAnimationEles();
        this.formatOpts(opts);
        this.getAnimationKeys(opts);
        this.createAnimations();
        if (opts.autoPlay)
            this.execute();
    }
    getAnimationKeys(opts) {
        const keys = [];
        for (const k in opts) {
            if (isAnimationKey(k))
                keys.push(k);
        }
        this.animationKeys = keys;
    }
    getAnimationType() {
        return 'css';
    }
    getAnimationEles() {
        let { target } = this.options;
        target = Array.isArray(target) ? target : [target];
        this.targets = [].concat(...target.map(d => {
            if (typeof d === 'string')
                return Array.from(document.querySelectorAll(d));
            return d;
        }));
    }
    formatOpts(opts) {
        this.animationOpts = updateObjectProps(defaultAnimationOpts, opts);
        this.tweenOpts = updateObjectProps(defaultTweenOpts, opts);
    }
    createAnimations() {
        const animations = [].concat(...this.targets.map(target => {
            return this.animationKeys.map(prop => (Object.assign(Object.assign({ target,
                prop }, this.animationOpts), { tweens: [{
                        value: this.options[prop],
                        to: this.options[prop],
                        from: getCssValue(target, prop),
                        easing: parseEasing(this.tweenOpts.easing)
                    }] })));
        }));
        this.animations = animations;
    }
    execute() {
        requestAnimationFrame(this.animationStep.bind(this));
    }
    animationStep(t) {
        if (this.startTime === void 0)
            this.startTime = t;
        const progressT = t - this.startTime;
        this.animations.forEach(item => {
            const tween = item.tweens[0];
            const eased = tween.easing(progressT / 1000);
            const newVal = (tween.to - tween.from) * eased + tween.from;
            console.log(newVal, '新值');
            setProgressValue['css'](item.target, item.prop, newVal + 'px');
        });
        if (progressT < 1000)
            requestAnimationFrame(this.animationStep.bind(this));
    }
}
export default Axi;
