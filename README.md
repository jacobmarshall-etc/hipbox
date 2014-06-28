# Hipbox

[![Travis CI](https://travis-ci.org/jacobmarshall/hipbox.svg)](https://travis-ci.org/jacobmarshall/hipbox)
[![devDependency Status](https://david-dm.org/jacobmarshall/hipbox/dev-status.svg)](https://david-dm.org/jacobmarshall/hipbox#info=devDependencies)
[![Release](http://img.shields.io/github/release/jacobmarshall/hipbox.svg)](https://github.com/jacobmarshall/hipbox)
[![GitHub Issues](http://img.shields.io/github/issues/jacobmarshall/hipbox.svg)](https://github.com/jacobmarshall/hipbox/issues)
[![MIT Licence](http://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jacobmarshall/hipbox/blob/master/LICENSE)

A lightweight embeddable Hipchat box

Please note: this project is a work in progress, if you do decide to use it, please remember that the API is not final, and is subject to change at any point. The removal of features/functionality is also possible in dev versions.

Hipbox has no dependencies on any other libraries.

## API

**Hipbox.config**

Example usage:

```javascript
Hipbox.config({
    open: true,
    animations: false
});
```

This API allows the modification of all [options](#options). All options are cached within a private scope, and whenever a change is made, only the options that have changed are used to make any DOM modifications.

## Compatibility

*This project has not been tested against all browsers, but the table below has been put together based on core Javascript functionality browsers do & don't support. If you believe this table is incorrect, please create a [Github Issue](https://github.com/jacobmarshall/hipbox/issues).*

| Browser           | Version |
| ----------------- | ------- |
| Internet Explorer | 8+      |
| Mozilla Firefox   | 3.5+    |
| Google Chrome     | `?`     |
| Apple Safari      | `?`     |
| Opera             | 10+     |

## Options

- **title** [String]

  The text to display in the heading.

  *Note: HTML is stripped from this text by default.*

- **caption** [String] Optional

  The small text to display under the title.

  *Note: HTML is stripped from this text by default.*

- **message** [String] Optional

  The message to display to a guest, when they enter your HipChat room.

- **key** [String]

  The key to your public HipChat room.

- **position** [String]

  The position to display the chatbox on the users screen. Must be one of the following options; `top left`, `top right`, `bottom left`, `bottom right`.

  These options can also be separated with a dash (`-`) instead of a space.

- **timezone** [String] Optional

  The timezone in which HipChat uses to display timestamps. By default this is automatically detected, but if it cannot be, it falls back to `PST`.

- **animations** [Boolean] Optional

  Sets the CSS animations on/off. Default is `true` (for browsers that support CSS animations).

- **domain** [String] Experimental

  The domain in which the HipChat server resides. Default is `http://www.hipchat.com`.

- **width** [Number] Optional

  The width of the chat box. Default is `400`.

- **height** [Number] Optional

  The height of the chat box. Default is `500`.

- **open** [Boolean] Optional

  Whether the chat box is open by default. Default is set to `false`.

- **beforeOpen** [Function]

  A callback which expects a boolean in return. This callback is invoked every time the user/system requests the chat box to be opened.

  If false is returned, the chat box will not open.

- **beforeClose** [Function]

  Same as the beforeOpen callback, except this is invoked whenever the user/system attempts to close the chat box.

- **afterOpen** [Function]

  A callback which is invoked whenever the chat box is opened.

- **afterClose** [Function]

  Same as the afterOpen callback, but invoked whenever the chat box is closed.

## Build

To build, you will need to install [NPM](https://www.npmjs.org/) which comes bundled with [Node.js](http://nodejs.org/download/).

Then change directories to the git repository, and run the following commands.

```bash
npm install
gulp build
```

The result is a directory named `dist` in the root of the project, containing both the CSS and Javascript minified code.

## Example

![Example Screenshot](https://raw.githubusercontent.com/jacobmarshall/hipbox/master/example/screenshot.png)