# `@oberonamsterdam/horizontal`

Framework agnostic plug and play horizontal scrolling without tricks.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


  - [Features](#features)
  - [Install](#install)
  - [Motivation](#motivation)
- [Usage](#usage)
  - [Add CSS](#add-css)
  - [API](#api)
  - [React hook](#react-hook)
  - [As a global](#as-a-global)
- [Examples](#examples)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Features 

- **Real X-axis scrolling**, no `translateX` tricks to 'simulate' scrolling.  
See [motivation](#motivation) for more clarification - summed up:  
    - Scroll position is not lost between navigations/reloads.    
    - Respects a11y (traversing through the site with tab works as expected)  
    - Link anchors will function as normally
- **Keyboard scroll** with configurable step amounts. (arrow keys, page up/down, space, etc)  
- Scroll navigation by keyboard is animated ('smooth') and respects inertia.   
- **React hook**  
A optional `useHorizontal` react hook under `@oberonamsterdam/horizontal/hook` is available.  
- Typescript typings.

### Install
```bash
npm i @oberonamsterdam/horizontal
```

### Motivation

There are a couple similar packages and articles like for example [horizontal-scroll](https://github.com/corentinfardeau/horizontal-scroll) that appear to be doing the do the same thing as this package.  
However, what separates this package from the rest is that it **doesn't do any translateX tricks**, the actual scrolling is done by the browser with CSS.  
  
Because users will still use their normal means of navigating through a website,  
We will catch mouse wheel and keyboard events and translate them to the X-axis - this is essentially all that this library does.
  
This results in the following advantages: 

- Normal X-axis scrolling is kept intact and won't be interfered with (e.g. touch devices/pads, magic mouses, you name it).  
This yields in better performance (no JS is required for this in the first place) and less bugs (we're not 'faking' anything).
- Scroll position will remain intact between pages because it's handled by the browser.  
- Normal browser behaviour such as #anchors will work as normal.  
- Instead of making your entire page content hardware accelerated (meaning the user's device has to render the entire page, even if it's outside of the viewport),  
browsers can use their usual optimisations they would also use for vertically scrolled pages.
- Accessibility: using tab to traverse the site (like many users with disabilities do) is impossible if you're using `translateX` tricks. 

To sum it up, because this is not a simulated scroll, a lot of the default stuff involving browser scrolling that you expect to work, will work.

There are some minor downsides to this approach:

- You will need to set some additional CSS on your container.   
**The lib will not do this for you.**

## Usage

### Add CSS

Add the recommended CSS to your container:

```css
// todo
```

### API
If you're looking for a react hook, you can skip this and check below.

- `new HorizontalScroll()`  
First argument is a optional [Options](src/ object.

- `horizontal.on('scroll', fn)`  
Listen to scroll events.   
It is recommended you bind to this instead of adding your own eventlisteners to `window` because this will tell you the scroll value after `horizontal`'s translations.

- `horizontal.off('scroll', fn)`  
Remove a event listener.  
[See node's `events` docs for further event handling specific methods.](http://nodejs.org/api/events.html#events_events)  

- `horizontal.destroy()`  
Removes events handlers.

### React hook
Arguments passed to the hook will be passed on to the constructor.  
See [API](#api) section.

```js
import useHorizontal from '@oberonamsterdam/horizontal/hook';

const Component = () => {
    useHorizontal();
    
    ...
}
```

### As a global

Albeit not recommended, you can use HorizontalScroll as a global:  
```
import '@oberonamsterdam/horizontal/global';

new HorizontalScroll();
```

## Examples

See [examples](examples) directory.
