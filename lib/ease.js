const overshoot = 1.70158;
const easeIns = {
    back: t => t * t * ((overshoot + 1) * t - overshoot),
    sin: t => Math.sin(t * Math.PI / 2),
    circle: t => Math.sqrt(1 - t * t),
    elastic: t => Math.pow(100, t) * Math.sin(8.5 * Math.PI * t) / 100,
    bounce: t => {
        let pow2, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { }
        ;
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
    },
    quad: t => Math.pow(t, 2),
    cubic: t => Math.pow(t, 3),
    quart: t => Math.pow(t, 4),
    quint: t => Math.pow(t, 5),
    expo: t => Math.pow(2, (10 * (t - 1)))
};
const easeOuts = {};
const easeInOuts = {};
for (const ease in easeIns) {
    easeOuts[ease] = t => 1 - easeIns[ease](1 - t);
    easeInOuts[ease] = t => t < 0.5 ? easeIns[ease](t * 2) / 2 : 1 - easeIns[ease](2 - 2 * t) / 2;
}
const easings = Object.assign(Object.assign(Object.assign({}, easeIns), easeOuts), easeInOuts);
export default easings;
