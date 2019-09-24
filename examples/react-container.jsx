import useHorizontal from '@oberon-amsterdam/horizontal/hook';
import * as React from 'react';
import { useState } from 'react';
import { render } from 'react-dom';

const Example = () => {
    // I'd prefer to use useRef, but we need a rerender to be triggered
    const [container, setContainer] = useState();

    useHorizontal({ container: container });

    return (
        <React.Fragment>
            <h1>Container example</h1>

            <div
                className="container"
                ref={ref => {
                    setContainer(ref);
                }}
            >
                <div className="block" id="start">
                    Hello, scroll further
                </div>

                <div className="block">Why hello there</div>

                <div className="block">
                    <a href="react.html">See react example</a>
                </div>

                <div className="block">
                    <a href="#start">Back to start</a>
                </div>
            </div>

            <p>
                Here's some cute kitty's to fill up some additional space to confirm that keyboard navigation only gets
                triggered in the container if container is in view.
            </p>

            <img src="https://placekitten.com/810/810" alt="Cat" />
            <img src="https://placekitten.com/811/811" alt="Cat" />
            <img src="https://placekitten.com/812/812" alt="Cat" />
            <img src="https://placekitten.com/813/813" alt="Cat" />
        </React.Fragment>
    );
};

render(<Example />, document.body);
