function parseUnit(val) {
    if (typeof val === 'object')
        return '';
    const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val + '');
    if (split)
        return split[1] || '';
}
function getCssValue(ele, prop) {
    if (prop in ele.style) {
        const cssProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        const val = ele.style[prop] || getComputedStyle(ele).getPropertyValue(cssProp) || '0';
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
const isObj = (val) => stringContains(Object.prototype.toString.call(val), 'object');
const isSvg = (el) => el instanceof SVGElement;
function isDom(ele) {
    return ele.nodeType || isSvg(ele);
}
const isHexCor = (str) => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(str);
const isHslCor = (str) => /^hsl/.test(str);
const isRgbCor = (str) => /^rgb/.test(str);
const isCor = (str) => isHexCor(str) || isHslCor(str) || isRgbCor(str);
const rgbaGen = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
const hex2rgba = (cor) => {
    const fullHexCor = cor.replace(/^#([A-F\d])([A-F\d])([A-F\d])$/i, (_, r, g, b) => r + r + g + g + b + b);
    const oxRgb = /^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i.exec(fullHexCor);
    const [_, r, g, b] = oxRgb;
    return rgbaGen(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1);
};
const hsl2rgba = (cor) => {
    const hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(cor) ||
        /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(cor);
    const h = parseInt(hsl[1], 10) / 360;
    const s = parseInt(hsl[2], 10) / 100;
    const l = parseInt(hsl[3], 10) / 100;
    const a = hsl[4] || 1;
    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    let r, g, b;
    if (s == 0) {
        r = g = b = l;
    }
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return rgbaGen(r * 255, g * 255, b * 255, a);
};
const rgb2rgba = (cor) => {
    const rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(cor);
    return rgb ? 'rgba(' + rgb[1] + ', 1)' : cor;
};
const color2rgba = (cor) => {
    if (isHexCor(cor))
        return hex2rgba(cor);
    if (isHslCor(cor))
        return hsl2rgba(cor);
    if (isRgbCor(cor))
        return rgb2rgba(cor);
    throw new Error('Please set the correct color(rgb, rgba, hex, hsl).');
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
function getCircleLength(el) {
    return Math.PI * 2 * +getAttribute(el, 'r');
}
function getRectLength(el) {
    return 2 * (+getAttribute(el, 'width') + (+getAttribute(el, 'height')));
}
function getLineLength(el) {
    const p1 = { x: +getAttribute(el, 'x1'), y: +getAttribute(el, 'y1') };
    const p2 = { x: +getAttribute(el, 'x2'), y: +getAttribute(el, 'y2') };
    return getDistance(p1, p2);
}
function getDistance(p1, p2) {
    const w = p1.x - p2.x;
    const h = p1.x - p2.y;
    return Math.sqrt(w * w + h * h);
}
function getPolylineLength(el) {
    const points = [...el.points];
    const len = points.length;
    return points.reduce((l, point, i) => {
        if (i === len - 1)
            return l + 0;
        const next = points[i + 1];
        return l + getDistance(point, next);
    }, 0);
}
function getPolygonLength(el) {
    const points = [...el.points];
    return getPolylineLength(el) + getDistance(points[0], points[points.length - 1]);
}
function getTotalLength(el) {
    if (el.getTotalLength)
        return el.getTotalLength();
    const n = el.tagName.toLowerCase();
    switch (n) {
        case 'circle': getCircleLength(el);
        case 'rect': getRectLength(el);
        case 'line': getLineLength(el);
        case 'polyline': getPolylineLength(el);
        case 'polygon': getPolygonLength(el);
    }
}
const motionPathNodeTypes = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon'];
const wrongMotionPathNode = 'The motion path node can only be one of (path, circle, rect, line, polyline, polygon).';
function selectMotionPathNode(el) {
    if (typeof el === 'string') {
        const nodes = document.querySelectorAll(el);
        for (const n of nodes) {
            if (isMotionPathNode(n)) {
                return n;
            }
        }
        throw new Error(wrongMotionPathNode);
    }
    else {
        if (isMotionPathNode(el)) {
            return el;
        }
        throw new Error(wrongMotionPathNode);
    }
}
function isMotionPathNode(el) {
    const n = el.tagName.toLowerCase();
    return motionPathNodeTypes.includes(n);
}
const requestAnimFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (cb) {
        return window.setTimeout(cb, 1000 / 60);
    };
const cancelRequestAnimFrame = window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    window.clearTimeout;

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

function getParentSvg(el) {
    let parent = el.parentNode;
    while (!isSvg(parent)) {
        parent = parent.parentNode;
    }
    return parent;
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
};
const defaultHooks = {
    axiStart: () => { },
    axiEnd: () => { },
    loopStart: () => { },
    loopEnd: () => { },
    updateStart: () => { },
    updateEnd: () => { }
};
function isAnimationKey(k) {
    return k !== 'target' && !defaultAnimationOpts.hasOwnProperty(k);
}
function isPathVal(val) {
    return isObj(val) && val.hasOwnProperty('totalLength');
}
function parseEasing(n) {
    const easingName = n.split('(')[0];
    const ease = easings[easingName];
    const match = /\(([^)]+)\)/.exec(n);
    const params = match ? match[1].split(',').map(parseFloat) : [];
    return ease.apply(null, params);
}
function decomposeValue(val, unit) {
    const reg = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
    const matchRet = ((isPathVal(val) ? val.totalLength : val) + '').match(reg);
    return {
        original: val,
        number: matchRet ? +matchRet[0] : 0,
        unit
    };
}
function decomposeCorValue(cor) {
    const original = color2rgba(cor);
    const rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
    return {
        original,
        number: original.match(rgx).map(Number),
        unit: ''
    };
}
function getPoint(el, curLen) {
    return el.getPointAtLength(curLen >= 1 ? curLen : 0);
}
function getPathProgressVal(value, progress) {
    const { prop, el, svg, totalLength } = value;
    const len = totalLength * progress;
    const current = getPoint(el, len);
    const prev = getPoint(el, len - 1);
    const next = getPoint(el, len + 1);
    switch (prop) {
        case 'x': return current.x - svg.x;
        case 'y': return current.y - svg.y;
        case 'angle': return Math.atan2(next.y - prev.y, next.x - prev.x) * 180 / Math.PI;
    }
}
function getSvgInfo(el) {
    const svg = getParentSvg(el);
    const { width, height } = svg.getBoundingClientRect();
    const viewBoxAttr = getAttribute(svg, 'viewBox');
    const viewBox = viewBoxAttr && viewBoxAttr.split(' ').map(n => +n) || [0, 0, width, height];
    return {
        el: svg,
        x: viewBox[0],
        y: viewBox[1],
        xScale: width / viewBox[2],
        yScale: height / viewBox[3],
    };
}
function composeCorNewVal(from, to, eased) {
    let ret = [];
    for (let i = 0; i < from.length; i++) {
        ret.push((to[i] - from[i]) * eased + from[i]);
    }
    return rgbaGen(ret[0], ret[1], ret[2], ret[3]);
}
class Axi {
    constructor(opts) {
        this.curTime = 0;
        this.lastTime = 0;
        this.duration = 0;
        this.paused = true;
        this.reversed = false;
        this.isPausedByBrowserHidden = false;
        this.axiStarted = false;
        this.axiEnded = false;
        this.options = opts;
        this.setAnimationOpts(opts);
        this.setReversed();
        this.setRestLoopCount();
        this.setHooks(opts);
        this.setAnimationEles();
        this.setAnimationKeys(opts);
        this.createAnimations();
        this.registerVisibilityEvent();
        this.duration = Math.max(...this.animations.map(d => d.duration))
            + Math.max(...this.animations.map(d => d.delay))
            + Math.max(...this.animations.map(d => d.endDelay));
        if (this.animationOpts.autoPlay) {
            this.newLoop();
            this.paused = false;
        }
    }
    registerVisibilityEvent() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !this.paused) {
                this.isPausedByBrowserHidden = true;
                this.pause();
            }
            if (!document.hidden && this.isPausedByBrowserHidden) {
                this.isPausedByBrowserHidden = false;
                this.play();
            }
        });
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
    setReversed() {
        const { direction, } = this.animationOpts;
        this.reversed = direction === 'reverse';
    }
    setRestLoopCount() {
        const { direction, loop } = this.animationOpts;
        if (typeof loop === 'number')
            this.restLoopCount = loop;
        else
            this.restLoopCount = loop ? -1 : (direction === 'alternate' ? 2 : 1);
    }
    setHooks(opts) {
        this.hooks = updateObjectProps(defaultHooks, opts);
    }
    createAnimations() {
        const animations = [].concat(...this.targets.map((target, idx, ary) => {
            const transformCache = isDom(target) ? getTransforms(target) : {};
            const { delay, endDelay, easing, round } = this.animationOpts;
            const curDelay = typeof delay === 'number' ? delay : delay(target, idx, ary.length);
            const curEndDelay = typeof endDelay === 'number' ? endDelay : endDelay(target, idx, ary.length);
            return this.animationKeys.map(prop => {
                const type = getAnimationType(target, prop);
                let opts = {
                    prop,
                    easing,
                    round,
                    delay: curDelay,
                    endDelay: curEndDelay,
                    duration: this.animationOpts.duration,
                    value: this.options[prop]
                };
                const propVal = this.options[prop];
                if (typeof propVal === 'object' && !isPathVal(propVal)) {
                    opts = updateObjectProps(opts, propVal);
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
            const isColor = isCor(d);
            const fromVal = i === 0 ? oriValue : vals[i - 1];
            const toVal = vals[i];
            let from, to;
            if (isColor) {
                from = decomposeCorValue(fromVal);
                to = decomposeCorValue(d);
            }
            else {
                from = decomposeValue(fromVal, parseUnit(fromVal) || oriUnit);
                to = decomposeValue(toVal, parseUnit(toVal) || oriUnit);
            }
            return {
                start: (i === 0 ? delay : 0) + durationPiece * i,
                end: delay + durationPiece * (i + 1) + (i === len - 1 ? endDelay : 0),
                duration: durationPiece,
                value: d,
                isPath: isPathVal(d),
                isColor,
                delay,
                from,
                to
            };
        });
    }
    execute() {
        this.rafId = requestAnimFrame(this.animationStep.bind(this));
    }
    animationStep(t) {
        const progressT = this.calcProgressT(t);
        this.hooks.updateStart();
        this.execAnimations(progressT);
        this.hooks.updateEnd();
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
            let newVal;
            if (tween.isColor)
                newVal = composeCorNewVal(tween.from.number, tween.to.number, eased);
            else if (tween.isPath)
                newVal = getPathProgressVal(tween.value, eased);
            else
                newVal = (tween.to.number - tween.from.number) * eased + tween.from.number;
            if (item.round && !tween.isColor)
                newVal = Math.round(newVal);
            if (tween.to.unit)
                newVal = newVal + tween.to.unit;
            const transforms = item.type === 'transform' ? item.transformCache : null;
            setProgressValue[item.type](item.target, item.prop, newVal, transforms);
        });
    }
    checkEnding(t) {
        const isEnd = this.reversed ? t <= 0 : t >= this.duration;
        if (isEnd) {
            this.hooks.loopEnd();
            if (this.animationOpts.direction === 'alternate') {
                this.reversed = !this.reversed;
            }
            if (this.restLoopCount > 0 || this.restLoopCount === -1) {
                this.newLoop();
            }
            else {
                this.paused = true;
                this.axiEnded = true;
                this.hooks.axiEnd();
            }
        }
    }
    pause() {
        if (this.paused)
            return;
        cancelRequestAnimFrame(this.rafId);
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
        this.setReversed();
        this.setRestLoopCount();
        this.paused = false;
        this.lastTime = 0;
        this.axiStarted = false;
        this.axiEnded = false;
        this.newLoop();
    }
    seek(p) {
        let progressT = p * this.duration;
        if (this.reversed)
            progressT = this.duration - progressT;
        this.execAnimations(progressT);
    }
    newLoop() {
        if (this.restLoopCount > 0)
            this.restLoopCount--;
        if (!this.axiStarted) {
            this.axiStarted = true;
            this.axiEnded = false;
            this.hooks.axiStart();
        }
        this.hooks.loopStart();
        this.lastTime = 0;
        this.startTime = 0;
        this.curTime = 0;
        this.execute();
    }
    reverse() {
        this.reversed = !this.reversed;
        this.restart();
    }
    static getMotionPath(el) {
        const path = selectMotionPathNode(el);
        return (prop) => ({
            prop,
            el: path,
            svg: getSvgInfo(path),
            totalLength: getTotalLength(path)
        });
    }
}

export default Axi;
