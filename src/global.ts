// entry point that assigns HorizontalScroll as a global var

import HorizontalScroll from './';

declare global {
    interface Window {
        HorizontalScroll: typeof HorizontalScroll;
    }
}

window.HorizontalScroll = HorizontalScroll;
