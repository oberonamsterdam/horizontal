<img src="https://jari.lol/7JqTxsErJS.png" width="350">

Framework agnostic plug and play horizontal scrolling without tricks.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Features](#features)
- [Install](#install)
- [Example usage](#example-usage)
  - [In it's simplest form](#in-its-simplest-form)
  - [Using a container](#using-a-container)
  - [React Hook](#react-hook)
- [Motivation](#motivation)
- [API](#api)
  - [Using horizontal as a global](#using-horizontal-as-a-global)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features 

- **Real X-axis scrolling**, no `translateX` tricks to 'simulate' scrolling.  
See [motivation](#motivation) for more clarification - summed up:  
    - Scroll position is not lost between navigations/reloads.    
    - Respects a11y (traversing through the site with tab works as expected)  
    - Link anchors will function as normally
- **Keyboard scroll** with configurable step amounts. (arrow keys, page up/down, space, etc)  
- Scroll navigation by keyboard is animated ('smooth') and respects inertia.   
- Make the entire viewport scrollable, or just a container.
- **React hook**  
A optional `useHorizontal` react hook under `@oberon-amsterdam/horizontal/hook` is available.  
- Typescript typings.

## Install
```bash
npm i @oberon-amsterdam/horizontal
```

## Example usage

### In it's simplest form  
Assumes the entire viewport needs to be scrolled.  
```js
import HorizontalScroll from '@oberon-amsterdam/horizontal';

new HorizontalScroll();
```
[Edit on CodeSandbox](https://codesandbox.io/s/github/oberonamsterdam/horizontal/tree/master/examples?module=/vanilla.js&initialpath=vanilla.html)  

### Using a container  
```js
import HorizontalScroll from '@oberon-amsterdam/horizontal';

new HorizontalScroll({ container: document.querySelector('.container') });
```
[Edit on CodeSandbox](https://codesandbox.io/s/github/oberonamsterdam/horizontal/tree/master/examples?module=/vanilla-container.js&initialpath=vanilla-container.html)

### React Hook  
```js
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
```
[Edit on CodeSandbox](https://codesandbox.io/s/github/oberonamsterdam/horizontal/tree/master/examples?module=/react.jsx&initialpath=react.html)    
[See react example with container](https://codesandbox.io/s/github/oberonamsterdam/horizontal/tree/master/examples?module=/react-container.jsx&initialpath=react-container.html)  

## Motivation

There are a couple similar packages and articles like for example [horizontal-scroll](https://github.com/corentinfardeau/horizontal-scroll) that appear to be doing the do the same thing as this package.  
However, what separates this package from the rest is that it **doesn't do any translateX tricks**, the actual scrolling is still done by the browser itself.  
  
Because users will use their normal means of navigating through a website, we will catch mouse wheel and keyboard events and translate them to the X-axis - this is essentially all that this library does.
  
This results in the following advantages: 

- Normal X-axis scrolling is kept intact and won't be interfered with (e.g. touch devices/pads, magic mouses, you name it).  
This yields in better performance (no JS is required for this in the first place) and less bugs (we're not 'faking' anything).
- Scroll position will remain intact between navigations because it's handled by the browser.  
- Normal browser behaviour like #anchors will work as normal.  
- Instead of making your entire page content hardware accelerated (meaning the user's device has to render the entire page, even if it's outside of the viewport),  
browsers can use their usual optimisations they would also use for vertically scrolled pages.
- Accessibility: using tab to traverse the site (like many users with disabilities do) is impossible if you're using `translateX` tricks. 

To sum it up, because this is not a simulated scroll, a lot of the default stuff involving browser scrolling that you expect to work, will work.

There is one downside to this approach:  

- Currently, there is no official way to hide scrollbars.   
However: all browsers have vendor specific workarounds for this (that the library automatically applies).  

## API
- `const horizontal = new HorizontalScroll()`  
Initializes a new instance of HorizontalScroll.  
First argument is an optional [Options](src/index.ts#L7-L10) object.
Here are the defaults and a quick explainer for each option:  
```ts
    new HorizontalScroll({
        // by default horizontal will use the entire viewport as a container.
        // optionally, you can enable horizontalscroll on a container only by passing a HTMLElement here
        container: document.documentElement,
        // if true, horizontal will not add additional CSS to hide container scrollbars 
        showScrollbars: false,

        // if true, scrolling up and down and using the up or down arrow key will prevent the user from scrolling.
        preventVerticalScroll: false,
    
        // amount of px to scroll when using arrow keys
        scrollAmount: 100,
        // amount of px to scroll when 'stepping' (pagedown/up, space, etc)
        scrollAmountStep: 1000,
    })
```

- `horizontal.on('scroll', fn)`  
Optionally listen to scroll events.   
It is recommended you bind to this instead of adding your own eventlisteners to `window` because this will tell you the scroll value after `horizontal`'s translations.

- `horizontal.off('scroll', fn)`  
Remove a event listener.  
[See node's `events` docs for further event handling specific methods.](http://nodejs.org/api/events.html#events_events)  

- `horizontal.destroy()`  
Removes events handlers.

### Using horizontal as a global

Albeit not recommended, you can use HorizontalScroll as a global:  
```
import '@oberon-amsterdam/horizontal/global';

new HorizontalScroll();
```
