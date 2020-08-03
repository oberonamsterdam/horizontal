"use strict";
// entry point that assigns HorizontalScroll as a global var
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __importDefault(require("./"));
window.HorizontalScroll = _1.default;

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var rebound_1 = require("rebound");
var SCROLL_AMOUNT = 100;
var SCROLL_AMOUNT_STEP = SCROLL_AMOUNT * 10;
var HorizontalScroll = /** @class */ (function (_super) {
    __extends(HorizontalScroll, _super);
    /**
     * Initialize a new horizontal scroll instance.
     * Will immediately bind to container.
     *
     */
    function HorizontalScroll(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.scrollAmount, scrollAmount = _c === void 0 ? SCROLL_AMOUNT : _c, _d = _b.scrollAmountStep, scrollAmountStep = _d === void 0 ? SCROLL_AMOUNT_STEP : _d, _e = _b.container, container = _e === void 0 ? document.documentElement : _e, _f = _b.showScrollbars, showScrollbars = _f === void 0 ? false : _f, _g = _b.preventVerticalScroll, preventVerticalScroll = _g === void 0 ? false : _g;
        var _this = _super.call(this) || this;
        _this.observer = null;
        _this.containerIsIntersecting = false;
        _this.style = null;
        _this.cssClass = "__horizontal-container-" + Math.round(Math.random() * 100000);
        _this.preventVerticalScroll = false;
        // ignore keydown events when any of these elements are focused
        _this.blacklist = ['input', 'select', 'textarea'];
        _this.wheel = function (e) {
            e.preventDefault();
            var angle = Math.atan2(e.deltaY, e.deltaX) / Math.PI;
            var forward = !(angle < 0.675 && angle > -0.375);
            var offset = Math.sqrt(Math.pow(e.deltaX, 2) + Math.pow(e.deltaY, 2));
            if (_this.preventVerticalScroll) {
                return;
            }
            switch (e.deltaMode) {
                case WheelEvent.DOM_DELTA_LINE:
                    offset *= SCROLL_AMOUNT;
                    break;
                case WheelEvent.DOM_DELTA_PAGE:
                    offset *= SCROLL_AMOUNT_STEP;
                    break;
                default:
                    break;
            }
            if (forward) {
                offset *= -1;
            }
            var distance = Math.max(_this.container.scrollLeft + offset, 0);
            if (distance < _this.container.scrollWidth - _this.container.clientWidth) {
                if (e.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
                    // force spring to new value & don't animate
                    _this.spring.setCurrentValue(distance);
                }
                else {
                    _this.spring.setEndValue(distance);
                }
            }
        };
        _this.keydown = function (e) {
            // only listen to key events if the container actually is in view
            if (_this.observer && !_this.containerIsIntersecting) {
                return;
            }
            var target = e.target;
            // if any blacklisted elements are focused, we'll won't handle this keydown.
            if (target &&
                target !== document.body &&
                _this.blacklist.includes(target.nodeName.toLowerCase())) {
                return;
            }
            var scrollValue = _this.container.scrollLeft;
            var max = _this.container.scrollWidth - _this.container.clientWidth;
            var prevent = true;
            switch (e.code) {
                case 'Home':
                    scrollValue = 0;
                    break;
                case 'End':
                    scrollValue = max;
                    break;
                case 'ArrowUp':
                    if (_this.preventVerticalScroll) {
                        prevent = true;
                        break;
                    }
                    else {
                        scrollValue -= SCROLL_AMOUNT;
                        break;
                    }
                case 'ArrowDown':
                    if (_this.preventVerticalScroll) {
                        prevent = true;
                        break;
                    }
                    else {
                        scrollValue += SCROLL_AMOUNT;
                        break;
                    }
                case 'ArrowLeft':
                    scrollValue -= SCROLL_AMOUNT;
                    break;
                case 'ArrowRight':
                    scrollValue += SCROLL_AMOUNT;
                    break;
                case 'PageUp':
                    scrollValue -= SCROLL_AMOUNT_STEP;
                    break;
                case 'PageDown':
                case 'Space':
                    scrollValue += SCROLL_AMOUNT_STEP;
                    break;
                default:
                    prevent = false;
                    break;
            }
            // correct scroll value if it's out of bounds
            scrollValue = Math.max(scrollValue, 0);
            scrollValue = Math.min(scrollValue, max);
            // if nothing changed, do nothing
            if (scrollValue === _this.spring.getEndValue()) {
                return;
            }
            if (prevent) {
                e.preventDefault();
            }
            if (_this.spring) {
                if (_this.spring.isAtRest()) {
                    _this.spring.setCurrentValue(_this.container.scrollLeft);
                }
                _this.spring.setEndValue(scrollValue);
            }
        };
        if (typeof container === 'undefined') {
            return _this;
        }
        _this.preventVerticalScroll = preventVerticalScroll;
        // bind events
        _this.container = container;
        _this.container.addEventListener('wheel', _this.wheel);
        document.addEventListener('keydown', _this.keydown);
        // set up interaction observer
        if (_this.container !== document.documentElement) {
            if ('IntersectionObserver' in window) {
                _this.observer = new IntersectionObserver(function (_a) {
                    var _b = __read(_a, 1), entry = _b[0];
                    _this.containerIsIntersecting = entry.isIntersecting;
                });
                _this.observer.observe(_this.container);
            }
            else {
                // tslint:disable-next-line:no-console
                console.warn('[horizontal-scroll] WARN: IntersectionObserver not available, assuming key navigation is always applicable to your container.');
            }
        }
        // add CSS to hide scrollbars
        if (!showScrollbars) {
            _this.container.classList.add(_this.cssClass);
            _this.style = document.createElement('style');
            document.head.appendChild(_this.style);
            var sheet = _this.style.sheet;
            if (sheet) {
                sheet.insertRule("\n                        ." + _this.cssClass + " {\n                            overflow-y: hidden;\n                            overflow-x: auto;\n\n                            /* prevents unwanted gestures and bounce effects */\n                            overscroll-behavior: auto;\n\n                            /* vendor specific hacks to hide scrollbars */\n                            scrollbar-width: none;\n                            -ms-overflow-style: none;\n                        }\n                    ");
                var webkitCss = "::-webkit-scrollbar { display: none; }";
                if (_this.container !== document.documentElement) {
                    webkitCss = "." + _this.cssClass + webkitCss;
                }
                sheet.insertRule(webkitCss);
            }
        }
        // init spring
        _this.springSystem = new rebound_1.SpringSystem();
        _this.spring = _this.springSystem.createSpring();
        _this.spring.setCurrentValue(_this.container.scrollLeft);
        _this.spring.setOvershootClampingEnabled(true);
        _this.spring.addListener({
            onSpringUpdate: function (currSpring) {
                var value = currSpring.getCurrentValue();
                _this.emit('scroll', value);
                // disallow gestures on the vertical axis. also disallow on horizontal when we've scrolled
                _this.container.style.overscrollBehaviorY = 'none';
                _this.container.style.overscrollBehaviorX = value > 0 ? 'none' : 'auto';
                _this.container.scrollLeft = value;
            },
        });
        _this.spring.notifyPositionUpdated();
        return _this;
    }
    HorizontalScroll.prototype.destroy = function () {
        if (typeof this.container === 'undefined') {
            return;
        }
        this.container.removeEventListener('wheel', this.wheel);
        document.removeEventListener('keydown', this.keydown);
        if (this.style) {
            this.style.remove();
        }
        this.container.classList.remove(this.cssClass);
        this.spring.destroy();
        this.springSystem.removeAllListeners();
        if (this.observer) {
            this.observer.disconnect();
        }
    };
    return HorizontalScroll;
}(events_1.EventEmitter));
exports.default = HorizontalScroll;
