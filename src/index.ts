import { EventEmitter } from 'events';
import { Spring, SpringSystem } from 'rebound';

const SCROLL_AMOUNT = 100;
const SCROLL_AMOUNT_STEP = SCROLL_AMOUNT * 10;

export interface Options {
    scrollAmount?: number;
    scrollAmountStep?: number;
    container?: HTMLElement;
    showScrollbars?: boolean;
}

declare global {
    interface CSSStyleDeclaration {
        overscrollBehaviorX: string;
        overscrollBehaviorY: string;
    }
}

export default class HorizontalScroll extends EventEmitter {
    private springSystem!: SpringSystem;
    private spring!: Spring;
    private container!: HTMLElement;
    private containerIsIntersecting: boolean = false;
    private observer: IntersectionObserver | null = null;
    private style: HTMLStyleElement | null = null;
    private cssClass = `__horizontal-container-` + Math.round(Math.random() * 100000);

    /**
     * Initialize a new horizontal scroll instance.
     * Will immediately bind to container.
     *
     */
    constructor({
        scrollAmount = SCROLL_AMOUNT,
        scrollAmountStep = SCROLL_AMOUNT_STEP,
        container = document.documentElement,
        showScrollbars = false,
    }: Options = {}) {
        super();

        if (typeof container === 'undefined') {
            return;
        }

        // bind events
        this.container = container;
        this.container.addEventListener('wheel', this.wheel);
        document.addEventListener('keydown', this.keydown);

        // set up interaction observer
        if (this.container !== document.documentElement) {
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver(([entry]) => {
                    this.containerIsIntersecting = entry.isIntersecting;
                });
                this.observer.observe(this.container);
            } else {
                // tslint:disable-next-line:no-console
                console.warn(
                    '[horizontal-scroll] WARN: IntersectionObserver not available, assuming key navigation is always applicable to your container.'
                );
            }
        }

        // add CSS to hide scrollbars
        if (!showScrollbars) {
            this.container.classList.add(this.cssClass);
            this.style = document.createElement('style');
            document.head.appendChild(this.style!);

            const sheet = this.style!.sheet as CSSStyleSheet;

            if (sheet) {
                sheet.insertRule(
                    `
                        .${this.cssClass} {
                            overflow-y: hidden;
                            overflow-x: auto;

                            /* prevents unwanted gestures and bounce effects */
                            overscroll-behavior: auto;

                            /* vendor specific hacks to hide scrollbars */
                            scrollbar-width: none;
                            -ms-overflow-style: none;
                        }
                    `
                );

                let webkitCss = `::-webkit-scrollbar { display: none; }`;
                if (this.container !== document.documentElement) {
                    webkitCss = `.${this.cssClass}` + webkitCss;
                }
                sheet.insertRule(webkitCss);
            }
        }

        // init spring
        this.springSystem = new SpringSystem();
        this.spring = this.springSystem.createSpring();
        this.spring.setCurrentValue(this.container.scrollLeft);
        this.spring.setOvershootClampingEnabled(true);
        this.spring.addListener({
            onSpringUpdate: (currSpring: Spring) => {
                const value = currSpring.getCurrentValue();
                this.emit('scroll', value);

                // disallow gestures on the vertical axis. also disallow on horizontal when we've scrolled
                this.container.style.overscrollBehaviorY = 'none';
                this.container.style.overscrollBehaviorX = value > 0 ? 'none' : 'auto';

                this.container.scrollLeft = value;
            },
        });
        this.spring.notifyPositionUpdated();
    }

    destroy() {
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

            e.preventDefault();
        }
    };

    private keydown = (e: KeyboardEvent) => {
        // only listen to key events if the container actually is in view
        if (this.observer && !this.containerIsIntersecting) {
            return;
        }

        const target = e.target as HTMLUnknownElement | null;

        // if any other elements are focused, we'll respect that
        if (target !== document.body) {
            return;
        }

        let scrollValue = this.container.scrollLeft;
        const max = this.container.scrollWidth - this.container.clientWidth;

        let prevent = true;

        switch (e.code) {
            case 'Home':
                scrollValue = 0;
                break;
            case 'End':
                scrollValue = max;
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
        if (scrollValue === this.spring.getEndValue()) {
            return;
        }

        if (prevent) {
            e.preventDefault();
        }

        if (this.spring) {
            this.spring.setEndValue(scrollValue);
        }
    };
}
