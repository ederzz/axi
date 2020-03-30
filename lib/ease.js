var overshoot = 1.70158;
export var easeIns = {
    back: function (t) { return t * t * ((overshoot + 1) * t - overshoot); },
    sin: function (t) { return Math.sin(t * Math.PI / 2); },
    circle: function (t) { return Math.sqrt(1 - t * t); },
    elastic: function (t) { return Math.pow(100, t) * Math.sin(8.5 * Math.PI * t) / 100; },
    bounce: function (t) {
        var pow2, b = 4;
        while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) { }
        ;
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
    },
    quad: function (t) { return Math.pow(t, 2); },
    cubic: function (t) { return Math.pow(t, 3); },
    quart: function (t) { return Math.pow(t, 4); },
    quint: function (t) { return Math.pow(t, 5); },
    expo: function (t) { return Math.pow(2, (10 * (t - 1))); }
};
export var easeOuts = {};
export var easeInOuts = {};
var _loop_1 = function (ease) {
    easeOuts[ease] = function (t) { return 1 - easeIns[ease](1 - t); };
    easeInOuts[ease] = function (t) { return t < 0.5 ? easeIns[ease](t * 2) / 2 : 1 - easeIns[ease](2 - 2 * t) / 2; };
};
for (var ease in easeIns) {
    _loop_1(ease);
}
