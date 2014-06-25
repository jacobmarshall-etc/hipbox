(function (factory) {
    window.Hipbox = factory();
})

(function () {
    var dom,
        self = {},
        config = {},
        defaults = {
            'title': '',
            'caption': '',
            'message': '',
            'key': '',
            'position': 'bottom right',
            'timezone': 'PST',
            'animations': true,
            'domain': 'http://www.hipchat.com',
            'width': 400,
            'height': 500,
            'open': false
        };

    // Utilities

    function log (message) {
        if ('console' in window) {
            window.console.log(message);
        }
    }

    function toArray (arr) {
        return Array.prototype.slice.apply(arr);
    }

    function safeFunction (cb) {
        if (cb instanceof Array) {
            return function () {
                var that = this;
                var args = toArray(arguments);
                var values = [];

                for (var i = 0; i < cb.length; i++) {
                    var ret = safeFunction(cb[i]).apply(that, args);
                    values = values.concat(ret);
                }

                return values;
            };
        } else {
            if (typeof cb !== 'function') {
                return function () {
                    return cb;
                };
            } else {
                return cb;
            }
        }
    }

    function onceFunction (cb) {
        var hasRun = false, value;
        cb = safeFunction(cb);

        return function (args) {
            if ( ! hasRun) {
                hasRun = true;
                return (value = cb.apply(null, args));
            } else {
                return value;
            }
        };
    }

    function delayFunction (cb) {
        return function () {
            var that = this;
            var args = toArray(arguments);

            setTimeout(function () {
                cb.apply(that, args);
            }, 0);
        };
    }

    function addEvent (node, event, cb) {
        cb = safeFunction(cb);

        if ('addEventListener' in node) {
            node.addEventListener(event, cb, false);
        } else {
            node.attachEvent('on' + event, cb);
        }
    }

    function isReady (readyState) {
        return readyState === null || readyState === 'complete' || readyState === 'interactive';
    }

    function whenReady (cb) {
        cb = onceFunction(cb);

        var eventHandler = function () {
            if (isReady(document.readyState)) {
                cb.call(window, document);
            }
        };

        // Be sure to invoke the event handler, as the event listeners
        // may never invoke (if the document has already loaded).
        eventHandler();

        // Register the event listeners (modern and legacy)
        addEvent(document, 'DOMContentLoaded', eventHandler);
        addEvent(document, 'readystatechange', eventHandler);
        addEvent(window, 'load', eventHandler);
    }

    function getClasses (el) {
        return el.className.split(' ');
    }

    function parseClasses (classes) {
        // Join the class names together & remove additional whitespace
        return classes.join(' ').replace(/\s{2,}/g, ' ');
    }

    function addClass (el, className) {
        var classList = getClasses(el);
        classList.push(className);

        el.className = parseClasses(classList);
    }

    function removeClass (el, className) {
        var classList = getClasses(el);

        var index;
        while ((index = classList.indexOf(className)) > -1) {
            classList.splice(index, 1);
        }

        el.className = parseClasses(classList);
    }

    function setClass (el, className, state) {
        var method = state ? addClass : removeClass;
        method(el, className);
    }

    function parseHtml (html) {
        var div = document.createElement('div');
        div.innerHTML = html;

        var first = div.firstElementChild || div.children[0];
        div.removeChild(first);

        div = null;
        return first;
    }

    function parseText (text) {
        var div = document.createElement('div');
        div.innerHTML = text;

        return div.innerText || div.textContent;
    }

    function findElement (id) {
        return dom.querySelector('#hipbox-' + id);
    }

    function parsePosition (pos) {
        return ('hipbox-' + pos).replace(' ', '-');
    }

    function setInnerText (id, text) {
        var el = findElement(id);
        if (el != null) {
            el.innerHTML = parseText(text);
        }
    }

    function clone (obj) {
        return extend({}, obj);
    }

    function extend (obj, other) {
        if (other == null) {
            return obj;
        }

        for (var key in other) {
            if (other.hasOwnProperty(key)) {
                var value = other[key];
                if (value.constructor === Object) {
                    extend(obj[key], value);
                } else {
                    obj[key] = value;
                }
            }
        }

        return obj;
    }

    function params (items) {
        var parts = [];

        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                parts.push([
                    encodeURIComponent(key),
                    encodeURIComponent(items[key])
                ].join('='));
            }
        }

        return parts.join('&');
    }

    function parseUrl (url) {
        var link = document.createElement('a');
        link.href = url;

        return link.href;
    }

    function api (cb) {
        return function () {
            var that = this;
            var args = toArray(arguments);

            // Invoke the original API function, return the returning value,
            // or return the 'this' for the invocation, allowing chaining.
            var ret = safeFunction(cb).apply(that, args);
            return typeof ret !== 'undefined' ? ret : that;
        };
    }

    function getChatUrl () {
        return parseUrl(
            getConfig('domain') + '/' +
            getConfig('key') + '?' +

            params({
                anonymous: true,
                compact: true,

                // Note: wrapped in single quotes for JSHint
                'welcome_msg': getConfig('message')
            })
        );
    }

    // Setup

    var addToDocument = onceFunction(function () {
        whenReady(function () {
            log('Appending element to document...');
            document.body.appendChild(dom);
        });
    });

    // Configuration

    function setConfigs (items) {
        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                setConfig(key, items[key]);
            }
        }
    }

    function setConfig (name, value) {
        var old = config[name];
        config[name] = value;

        // Notify the config hook of the update
        setConfigHook(name, value, old);
    }

    function getConfig (name) {
        if (name in config) {
            return config[name];
        } else {
            return defaults[name];
        }
    }

    function getFullConfig (items) {
        // Concatenate an entire set of configuration items, given the
        // defaults, current items, and manual overrides.
        var data = extend(clone(defaults), config);
        return extend(data, items);
    }

    // Hooks

    function setConfigHook (name, value, old) {
        if (value !== old) {
            log('Calling ConfigHook[' + name + ']...');
            safeFunction(setConfigHooks[name])(value, old);
        }
    }

    var setConfigHooks = {

        'title': function (value) {
            setInnerText('title', value);
        },

        'caption': function (value) {
            setInnerText('caption', value);
        },

        'open': function (value) {
            setClass(dom, 'hipbox-open', value);
        },

        'position': function (value, old) {
            removeClass(dom, parsePosition(old));
            addClass(dom, parsePosition(value));
        },

        'animations': function (value) {
            setClass(dom, 'hipbox-animate', value);
        },

        'width': function (value) {
            findElement('content').style.width = value + 'px';
        },

        'height': function (value) {
            findElement('content').style.height = value + 'px';
        }

    };

    // Implementation

    self.config = api(function (items) {
        var conf = getFullConfig(items);
        setConfigs(conf);

        // Automatically initiate the plugin
        self.init();
    });

    self.set = api(function (name, value) {
        setConfig(name, value);
    });

    self.open = api(function () {
        setConfig('open', true);
    });

    self.close = api(function () {
        setConfig('open', false);
    });

    self.init = api(function () {
        addToDocument();
    });

    // Publish a set of defaults (read-only).
    self.defaults = clone(defaults);

    // Document model

    dom = parseHtml(
        '<div id="hipbox-container" class="hipbox">' +
            '<div id="hipbox-inner" class="hipbox-inner">' +
                '<div id="hipbox-heading" class="hipbox-heading">' +
                    '<h1 id="hipbox-title" class="hipbox-title"></h1>' +
                    '<p id="hipbox-caption" class="hipbox-caption"></p>' +
                '</div>' +
                '<div id="hipbox-content" class="hipbox-content">' +
                    '<iframe src="about:blank" id="hipbox-frame" class="hipbox-frame"></iframe>' +
                '</div>' +
            '</div>' +
        '</div>'
    );

    return self;
});