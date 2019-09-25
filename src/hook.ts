import { useEffect, useRef } from 'react';
import HorizontalScroll, { Options } from './index';

const useHorizontal = (options: Options = {}) => {
    const horizontal = useRef<HorizontalScroll>();
    useEffect(() => {
        horizontal.current = new HorizontalScroll(options);

        return () => {
            if (horizontal.current) {
                horizontal.current.destroy();
            }
        };
    }, [options.container, options.scrollAmount, options.scrollAmountStep, options.showScrollbars]);
};

export default useHorizontal;
