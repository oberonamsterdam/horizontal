import useHorizontal from '@oberon-amsterdam/horizontal/hook';
import * as React from 'react';
import { render } from 'react-dom';

const Example = () => {
    useHorizontal();

    return (
        <React.Fragment>
            <div className="block">Hello, scroll further</div>

            <div className="block">Why hello there</div>

            <div className="block">
                <a href="react.html">Whee</a>
            </div>
        </React.Fragment>
    );
};

render(<Example />, document.body);
