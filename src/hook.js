"use strict";
exports.__esModule = true;
var react_1 = require("react");
var index_1 = require("./index");
var useHorizontal = function (options) {
    if (options === void 0) { options = {}; }
    var horizontal = react_1.useRef();
    react_1.useEffect(function () {
        horizontal.current = new index_1["default"](options);
        return function () {
            if (horizontal.current) {
                horizontal.current.destroy();
            }
        };
    }, [options.container, options.scrollAmount, options.scrollAmountStep, options.showScrollbars]);
};
exports["default"] = useHorizontal;
