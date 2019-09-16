import { EventEmitter } from 'events';
import { Spring, SpringSystem } from 'rebound';

const SCROLL_AMOUNT = 100;
const SCROLL_AMOUNT_STEP = SCROLL_AMOUNT * 10;

export interface Options {
    scrollAmount?: number;
    scrollAmountStep?: number;
    container?: HTMLElement;
}

export default class HorizontalScroll extends EventEmitter {
    springSystem!: SpringSystem;
    spring!: Spring;
    container!: HTMLElement;

    /**
     * Initialize a new horizontal scroll instance.
     * Will immediately bind to container.
     *
     */
    constructor({
        scrollAmount = SCROLL_AMOUNT,
        scrollAmountStep = SCROLL_AMOUNT_STEP,
        container = document.documentElement,
    }: Options = {}) {
        super();

        if (typeof container === 'undefined') {
            return;
        }

        // bind events
        this.container = container;
        container.addEventListener('wheel', this.wheel);
        container.addEventListener('keydown', this.keydown);

        // init spring
        this.springSystem = new SpringSystem();
        this.spring = this.springSystem.createSpring();
        this.spring.setCurrentValue(this.container.scrollLeft);
        this.spring.setOvershootClampingEnabled(true);
        this.spring.addListener({
            onSpringUpdate: (currSpring: Spring) => {
                const value = currSpring.getCurrentValue();
                this.emit('scroll', value);

                this.container.scrollLeft = currSpring.getCurrentValue();
            },
        });
    }

    destroy() {
        if (typeof this.container === 'undefined') {
            return;
        }

        this.container.removeEventListener('wheel', this.wheel);
        this.container.removeEventListener('keydown', this.keydown);

        this.spring.destroy();
        this.springSystem.removeAllListeners();
    }

    private wheel = (e: WheelEvent) => {
        const angle = Math.atan2(e.deltaY, e.deltaX) / Math.PI;
        const forward = !(angle < 0.675 && angle > -0.375);
        let offset = Math.sqrt(Math.pow(e.deltaX, 2) + Math.pow(e.deltaY, 2));

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
        const distance = Math.max(this.container.scrollLeft + offset, 0);

        if (distance < this.container.scrollWidth - this.container.clientWidth) {
            if (e.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
                // force spring to new value & don't animate
                this.spring.setCurrentValue(distance);
            } else {
                this.spring.setEndValue(distance);
            }
        }
    };

    private keydown = (e: KeyboardEvent) => {
        const target = e.target as HTMLUnknownElement | null;
        let scrollValue = window.pageXOffset;
        let prevent = true;
        const targetType = target && target.nodeName.toLowerCase();
        switch (e.code) {
            case 'Home':
                scrollValue = 0;
                break;
            case 'End':
                scrollValue = this.container.scrollWidth - this.container.clientWidth;
                break;
            case 'ArrowUp':
                scrollValue -= SCROLL_AMOUNT;
                break;
            case 'ArrowDown':
                scrollValue += SCROLL_AMOUNT;
                break;
            case 'PageUp':
                scrollValue -= SCROLL_AMOUNT_STEP;
                break;
            case 'PageDown':
            case 'Space':
                // TODO: this could be more elegant.
                if (targetType === 'textarea' || targetType === 'input') {
                    return;
                }
                scrollValue += SCROLL_AMOUNT_STEP;
                break;
            default:
                prevent = false;
                break;
        }

        if (prevent) {
            e.preventDefault();
        }

        if (this.spring) {
            this.spring.setEndValue(scrollValue);
        }
    };
}
