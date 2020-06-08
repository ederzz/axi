export function parseUnit(val: string | number) {
    var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val + '');
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