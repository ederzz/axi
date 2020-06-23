export function parseUnit(val: string | number | object) {
    if (typeof val === 'object') return '' // TODO:
    const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val + '');
    if (split) return split[1] || ''
}

export function getCssValue(ele: HTMLElement, prop: string) {
    if (prop in ele.style) {
        const val = ele.style[prop as any] || getComputedStyle(ele).getPropertyValue(prop) || '0'
        return val
    }
    return '0'
}

export function updateObjectProps(o1: any, o2: any) {
    const cloneObj = { ...o1 }
    for (const k in o1) {
        cloneObj[ k ] = o2.hasOwnProperty(k) ? o2[k] : o1[k]
    }

    return cloneObj
}

export function minMax(a: number, b: number, c: number) {
    return Math.min(Math.max(a, b), c)
}

export function isDom(ele: HTMLElement) {
    return ele.nodeType
}

const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

export function getAttribute(el: Element, prop: string) {
    return el.getAttribute(prop);
}

export function arrayContains(ary: any[], item: any) {
    return ary.some(d => d === item)
}

export function getAnimationType(el: HTMLElement, prop: string) {
    if (isDom(el)) {
        if (arrayContains(validTransforms, prop)) return 'transform'
        if (prop !== 'transform' && getCssValue(el, prop)) return 'css'
        if (getAttribute(el, prop)) return 'attribute'
    }
    if ((el as any)[prop] !== null) return 'object'
}

export function getTransforms(el: HTMLElement) {
    if (!isDom(el)) return {}
    const transform = el.style.transform || ''
    const reg  = /(\w+)\(([^)]*)\)/g;
    const m = {} as any
    let execRet
    while (execRet = reg.exec(transform)) {
        m[execRet[1]] = execRet[2]
    }
    return m
}

function getTransformValue(el: HTMLElement, prop: string) {
    const defaultVal = stringContains(prop, 'scale') ? 1 : 0 + getTransformUnit(prop)
    return getTransforms(el)[prop] || defaultVal
}

export function getTargetOriValue(type: string, target: HTMLElement, prop: string) {
    switch (type) {
      case 'transform': return getTransformValue(target, prop)
      case 'css': return getCssValue(target, prop)
      case 'attribute': return getAttribute(target, prop)
      default: return (target as any)[prop] || 0;
    }
}

export const setProgressValue = { 
    css: (t: HTMLElement, p: string, v: any) => { (t.style as any)[p] = v },
    attribute: (t: HTMLElement, p: string, v: any) => { t.setAttribute(p, v) },
    object: (t: any, p: any, v: any) => { t[p] = v },
    transform: (t: any, p: any, v: any, transforms: any) => {
        transforms[p] = v
        let newVal = ''
        Object.keys(transforms).forEach(k => {
            newVal += `${ k }(${ transforms[k] }) `
        })
        t.style.transform = newVal
    }
}

export const isObj = (val: any) => stringContains(String.prototype.toString.call(val), 'object')
export const isSvg = (el: any): el is SVGElement => el instanceof SVGElement

function stringContains(str: string, text: string) {
    return str.indexOf(text) > -1
}

function getTransformUnit(prop: string) {
    if (stringContains(prop, 'translate') || prop === 'perspective') return 'px'
    if (stringContains(prop, 'rotate') || stringContains(prop, 'skew')) return 'deg'
}

function getCircleLength(el: SVGCircleElement) {
    return Math.PI * 2 * +getAttribute(el, 'r')
}

function getRectLength(el: SVGRectElement) {
    return 2 * ( +getAttribute(el, 'width') + (+getAttribute(el, 'height')))
}

type Point = [ number, number ]

function getLineLength(el: SVGLineElement) {
    const p1: Point = [ +getAttribute(el, 'x1'), +getAttribute(el, 'y1') ]
    const p2: Point = [ +getAttribute(el, 'x2'), +getAttribute(el, 'y2') ]
    return getDistance(p1, p2)
}

function getDistance(p1: Point, p2: Point) {
    const w = p1[0] - p2[0]
    const h = p1[1] - p2[1]
    return Math.sqrt( w * w + h * h )
}

// 兼容多个空格分隔 TODO: el.points实现
function getPolylineLength(el: SVGPolylineElement) {
    const points = getAttribute(el, 'points').split(' ')
    const len = points.length
    return points.reduce((l, point, i) => {
        if (i === len - 1) return l + 0
        const next = point[i + 1]
        const p1 = point.split(',').map(d => +d)
        const p2 = next.split(',').map(d => +d)
        return l + getDistance(p1 as Point, p2 as Point)
    }, 0)
}

function getPolygonLength(el: SVGPolygonElement) {

}

// get total length of path(path, cirlce, rect, line, polyline, polygon)
export function getTotalLength(el: any) {
    if (el.getTotalLength) return el.getTotalLength()

    const n = el.tagName.toLowerCase() 
    switch (n) {
        case 'circle': getCircleLength(el)
        case 'rect': getRectLength(el)
        case 'line': getLineLength(el)
        case 'polyline': getPolylineLength(el)
        case 'polygon': getPolygonLength(el)
        // TODO: throw error
    }
}