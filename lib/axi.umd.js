(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Axi = factory());
}(this, (function () { 'use strict';

    const overshoot = 1.70158;
    const eases = {
        Back: t => t * t * ((overshoot + 1) * t - overshoot),
        Sin: t => Math.sin(t * Math.PI / 2),
        Circle: t => Math.sqrt(1 - t * t),
        Elastic: t => Math.pow(100, t) * Math.sin(8.5 * Math.PI * t) / 100,
        Bounce: t => {
            let pow2, b = 4;
            while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { }
            return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
        },
        Quad: t => Math.pow(t, 2),
        Cubic: t => Math.pow(t, 3),
        Quart: t => Math.pow(t, 4),
        Quint: t => Math.pow(t, 5),
        Expo: t => Math.pow(2, (10 * (t - 1)))
    };
    const easings = {};
    for (const n in eases) {
        easings['easeIn' + n] = eases[n];
        easings['easeOut' + n] = t => 1 - eases[n](1 - t);
        easings['easeInOut' + n] = t => t < 0.5 ? eases[n](t * 2) / 2 : 1 - eases[n](2 - 2 * t) / 2;
    }

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
        return getTransforms(el)[prop];
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

    const defaultAnimationOpts = {
        delay: 0,
        endDelay: 0,
        easing: 'sin',
        duration: 1000,
        autoPlay: true
    };
    function isAnimationKey(k) {
        return k !== 'target' && !defaultAnimationOpts.hasOwnProperty(k);
    }
    function parseEasing(n) {
        return easings[n || 'sin'];
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
            this.options = opts;
            this.setAnimationOpts(opts);
            this.setAnimationEles();
            this.setAnimationKeys(opts);
            this.createAnimations();
            if (opts.autoPlay)
                this.execute();
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
        }
        createAnimations() {
            const animations = [].concat(...this.targets.map(target => {
                const transformCache = getTransforms(target);
                return this.animationKeys.map(prop => {
                    const { delay, endDelay, easing } = this.animationOpts;
                    const type = getAnimationType(target, prop);
                    const tweens = this.parseTweens(target, type, prop, this.options[prop]);
                    return {
                        target,
                        prop,
                        tweens,
                        delay,
                        endDelay,
                        type,
                        transformCache,
                        easing: parseEasing(easing),
                    };
                });
            }));
            this.animations = animations;
        }
        parseTweens(target, type, prop, value) {
            const { delay, endDelay, duration, } = this.animationOpts;
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
            requestAnimationFrame(this.animationStep.bind(this));
        }
        animationStep(t) {
            if (this.startTime === void 0)
                this.startTime = t;
            const progressT = t - this.startTime;
            this.animations.forEach(item => {
                const tween = item.tweens.filter(d => progressT < d.end)[0];
                if (!tween)
                    return;
                const eased = item.easing(minMax(progressT - tween.start - tween.delay, 0, tween.duration) / tween.duration);
                const newVal = (tween.to.number - tween.from.number) * eased + tween.from.number;
                setProgressValue[item.type](item.target, item.prop, tween.to.unit ? newVal + tween.to.unit : newVal, item.type === 'transform' ? item.transformCache : null);
            });
            this.checkEnding(progressT);
            if (!this.paused)
                requestAnimationFrame(this.animationStep.bind(this));
        }
        checkEnding(t) {
            const { delay, endDelay, duration } = this.animationOpts;
            if (t >= delay + endDelay + duration)
                this.paused = true;
        }
    }

    return Axi;

})));
