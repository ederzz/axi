function parseUnit(val) {
    var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val + '');
    if (split)
        return split[1] || '';
}
function getCssValue(ele, prop) {
    if (prop in ele.style) {
        const val = ele.style[prop] || getComputedStyle(ele).getPropertyValue(prop) || '0';
        return val;
    }
    return '0';
}
function updateObjectProps(o1, o2) {
    const cloneObj = Object.assign({}, o1);
    for (const k in o1) {
        cloneObj[k] = o2.hasOwnProperty(k) ? o2[k] : o1[k];
    }
    return cloneObj;
}
function minMax(a, b, c) {
    return Math.min(Math.max(a, b), c);
}
function isDom(ele) {
    return ele.nodeType;
}
const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];
function getAttribute(el, prop) {
    return el.getAttribute(prop);
}
function arrayContains(ary, item) {
    return ary.some(d => d === item);
}
function getAnimationType(el, prop) {
    if (isDom(el)) {
        if (arrayContains(validTransforms, prop))
            return 'transform';
        if (prop !== 'transform' && getCssValue(el, prop))
            return 'css';
        if (getAttribute(el, prop))
            return 'attribute';
    }
    if (el[prop] !== null)
        return 'object';
}
function getTransforms(el) {
    if (!isDom(el))
        return {};
    const transform = el.style.transform || '';
    const reg = /(\w+)\(([^)]*)\)/g;
    const m = {};
    let execRet;
    while (execRet = reg.exec(transform)) {
        m[execRet[1]] = execRet[2];
    }
    return m;
}
function getTransformValue(el, prop) {
    const defaultVal = stringContains(prop, 'scale') ? 1 : 0 + getTransformUnit(prop);
    return getTransforms(el)[prop] || defaultVal;
}
function getTargetOriValue(type, target, prop) {
    switch (type) {
        case 'transform': return getTransformValue(target, prop);
        case 'css': return getCssValue(target, prop);
        case 'attribute': return getAttribute(target, prop);
        default: return target[prop] || 0;
    }
}
const setProgressValue = {
    css: (t, p, v) => { t.style[p] = v; },
    attribute: (t, p, v) => { t.setAttribute(p, v); },
    object: (t, p, v) => { t[p] = v; },
    transform: (t, p, v, transforms) => {
        transforms[p] = v;
        let newVal = '';
        Object.keys(transforms).forEach(k => {
            newVal += `${k}(${transforms[k]}) `;
        });
        t.style.transform = newVal;
    }
};
function stringContains(str, text) {
    return str.indexOf(text) > -1;
}
function getTransformUnit(prop) {
    if (stringContains(prop, 'translate') || prop === 'perspective')
        return 'px';
    if (stringContains(prop, 'rotate') || stringContains(prop, 'skew'))
        return 'deg';
}

const c1 = 1.70158;
const c3 = c1 + 1;
const eases = {
    Sine: () => (t) => 1 - Math.cos(t * Math.PI / 2),
    Circle: () => (t) => 1 - Math.sqrt(1 - t * t),
    Back: () => (t) => c3 * (Math.pow(t, 3)) - c1 * t * t,
    Bounce: () => (t) => {
        let pow2, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { }
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
    },
    Quad: () => (t) => Math.pow(t, 2),
    Cubic: () => (t) => Math.pow(t, 3),
    Quart: () => (t) => Math.pow(t, 4),
    Quint: () => (t) => Math.pow(t, 5),
    Expo: () => (t) => t =  Math.pow(2, (10 * (t - 1))),
    Elastic: (amplitude, period) => {
        if (amplitude === void 0)
            amplitude = 1;
        if (period === void 0)
            period = .5;
        let a = minMax(amplitude, 1, 10);
        let p = minMax(period, .1, 2);
        return (t) => {
            return (t === 0 || t === 1)
                ? t
                : -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        };
    }
};
const easings = {
    linear: () => (t) => t
};
for (const n in eases) {
    const easeIn = eases[n];
    easings['easeIn' + n] = easeIn;
    easings['easeOut' + n] = (a, b) => (t) => 1 - easeIn(a, b)(1 - t),
        easings['easeInOut' + n] = (a, b) => (t) => t < 0.5
            ? easeIn(a, b)(t * 2) / 2
            : 1 - easeIn(a, b)(t * -2 + 2) / 2;
}

const defaultAnimationOpts = {
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    duration: 1000,
    autoPlay: true,
    loop: false,
    direction: 'normal'
};
function isAnimationKey(k) {
    return k !== 'target' && !defaultAnimationOpts.hasOwnProperty(k);
}
function parseEasing(n) {
    const easingName = n.split('(')[0];
    const ease = easings[easingName];
    const match = /\(([^)]+)\)/.exec(n);
    const params = match ? match[1].split(',').map(parseFloat) : [];
    return ease.apply(null, params);
}
function decomposeValue(val, unit) {
    var reg = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
    const matchRet = (val + '').match(reg);
    return {
        original: val,
        number: matchRet ? +matchRet[0] : 0,
        unit
    };
}
class Axi {
    constructor(opts) {
        this.curTime = 0;
        this.lastTime = 0;
        this.duration = 0;
        this.paused = true;
        this.reversed = false;
        this.options = opts;
        this.setAnimationOpts(opts);
        this.setAnimationEles();
        this.setAnimationKeys(opts);
        this.createAnimations();
        this.duration = Math.max(...this.animations.map(d => d.duration))
            + Math.max(...this.animations.map(d => d.delay))
            + Math.max(...this.animations.map(d => d.endDelay));
        if (this.animationOpts.autoPlay) {
            this.paused = false;
            this.execute();
        }
    }
    setAnimationKeys(opts) {
        const keys = [];
        for (const k in opts) {
            if (isAnimationKey(k))
                keys.push(k);
        }
        this.animationKeys = keys;
    }
    setAnimationEles() {
        let { target } = this.options;
        target = Array.isArray(target) ? target : [target];
        this.targets = [].concat(...target.map(d => {
            if (typeof d === 'string')
                return Array.from(document.querySelectorAll(d));
            return d;
        }));
    }
    setAnimationOpts(opts) {
        this.animationOpts = updateObjectProps(defaultAnimationOpts, opts);
        this.reversed = this.animationOpts.direction === 'reverse';
    }
    createAnimations() {
        const animations = [].concat(...this.targets.map((target, idx, ary) => {
            const transformCache = getTransforms(target);
            const { delay, endDelay, easing } = this.animationOpts;
            const curDelay = typeof delay === 'number' ? delay : delay(target, idx, ary.length);
            const curEndDelay = typeof endDelay === 'number' ? endDelay : endDelay(target, idx, ary.length);
            return this.animationKeys.map(prop => {
                const type = getAnimationType(target, prop);
                let opts = {
                    prop,
                    easing,
                    delay: curDelay,
                    endDelay: curEndDelay,
                    duration: this.animationOpts.duration,
                    value: this.options[prop]
                };
                const propValue = this.options[prop];
                if (typeof propValue === 'object') {
                    opts = updateObjectProps(opts, propValue);
                }
                opts.easing = parseEasing(opts.easing);
                const tweens = this.parseTweens(target, type, opts);
                return Object.assign({ target,
                    tweens,
                    type,
                    transformCache }, opts);
            });
        }));
        this.animations = animations;
    }
    parseTweens(target, type, opts) {
        const { prop, delay, endDelay, value, duration } = opts;
        const oriValue = getTargetOriValue(type, target, prop);
        const oriUnit = parseUnit(oriValue);
        const vals = Array.isArray(value) ? value : [value];
        const len = vals.length;
        const durationPiece = duration / len;
        return vals.map((d, i) => {
            const fromVal = i === 0 ? oriValue : vals[i - 1];
            const from = decomposeValue(fromVal, parseUnit(fromVal) || oriUnit);
            const toVal = vals[i];
            const to = decomposeValue(toVal, parseUnit(toVal) || oriUnit);
            return {
                start: (i === 0 ? delay : 0) + durationPiece * i,
                end: delay + durationPiece * (i + 1) + (i === len - 1 ? endDelay : 0),
                duration: durationPiece,
                value: d,
                delay,
                from,
                to
            };
        });
    }
    execute() {
        this.rafId = requestAnimationFrame(this.animationStep.bind(this));
    }
    animationStep(t) {
        const progressT = this.calcProgressT(t);
        this.execAnimations(progressT);
        this.checkEnding(progressT);
        if (!this.paused)
            this.execute();
    }
    calcProgressT(t) {
        if (!this.startTime)
            this.startTime = t;
        const progressT = t - this.startTime + this.lastTime;
        this.curTime = progressT;
        return this.reversed ? this.duration - progressT : progressT;
    }
    execAnimations(progressT) {
        this.animations.forEach(item => {
            const tween = item.tweens.filter(d => progressT <= d.end)[0];
            if (!tween)
                return;
            const eased = item.easing(minMax(progressT - tween.delay, 0, tween.duration) / tween.duration);
            const newVal = (tween.to.number - tween.from.number) * eased + tween.from.number;
            setProgressValue[item.type](item.target, item.prop, tween.to.unit ? newVal + tween.to.unit : newVal, item.type === 'transform' ? item.transformCache : null);
        });
    }
    checkEnding(t) {
        const isEnd = this.reversed ? t <= 0 : t >= this.duration;
        if (isEnd) {
            if (this.animationOpts.direction === 'alternate') {
                this.reversed = !this.reversed;
            }
            if (this.animationOpts.loop) {
                this.restart();
            }
            else {
                this.paused = true;
            }
        }
    }
    pause() {
        if (this.paused)
            return;
        cancelAnimationFrame(this.rafId);
        this.paused = true;
        this.startTime = 0;
        this.lastTime = this.curTime;
    }
    play() {
        if (!this.paused)
            return;
        this.paused = false;
        this.execute();
    }
    restart() {
        this.paused = false;
        this.startTime = 0;
        this.curTime = 0;
        this.execute();
    }
    seek(p) {
        const progressT = p * this.duration;
        this.execAnimations(this.reversed ? this.duration - progressT : progressT);
    }
    reverse() {
        this.reversed = !this.reversed;
        this.restart();
    }
}

export default Axi;
