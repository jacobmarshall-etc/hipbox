(function (factory) {
    window.Hipbox = factory();
})

(function () {

    var self = {},
        options = {},
        old = {},

        // An empty function with no operations :(
        noop = function () {},
        firstUpdate = true;

    function whenReady (cb, ctx) {
        var hasInvoked = false;

        // Create a ready callback for when the readyState changes, whether
        // it is from the DOMContentLoaded event, readystatechange or window onload.
        var handleReady = function () {
            if ( ! hasInvoked &&
                document.readyState != null &&
                (document.readyState === 'complete' ||
                document.readyState === 'interactive')) {
                // Prevent the callback from invoking more than once
                hasInvoked = true;
                cb.call(ctx);
            }
        };

        // Invoke the ready callback, in case the dom has already loaded
        handleReady();

        // If the callback still hasn't been invoked, attach a listener
        if ( ! hasInvoked) {
            addEvent(document, 'DOMContentLoaded', handleReady);
            addEvent(document, 'readystatechange', handleReady);
            addEvent(window, 'load', handleReady);
        }
    }

    function parseElement (html) {
        // Create the outer container, so we can parse the html
        var outer = document.createElement('div');
        outer.innerHTML = html;

        // Grab the first element in the container, and disconnect it
        var first = outer.firstElementChild || outer.children[0];
        outer.removeChild(first);

        // Return the first element (parsed)
        return first;
    }

    function parseText (text) {
        // Create the outer container to pass the text through to
        var outer = document.createElement('div');
        outer.innerHTML = text;

        // Return the inner text/text content parsed by the dom
        return outer.innerText || outer.textContent;
    }

    function findElement (id) {
        // Get the corresponding element with the id of...
        return domElement.querySelector('[id="hb:' + id + '"]');
    }

    function getTimezone () {
        // Extract the timezone from a newly constructed date object
        return new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1] || 'PST';
    }

    function addEvent (node, event, cb) {
        if ('addEventListener' in node) {
            // Use the W3C spec for adding an event listener
            node.addEventListener(event, cb, false);
        } else {
            // 'Attach' an event for legacy IE browsers
            node.attachEvent('on' + event, cb);
        }
    }

    function addClass (node, className) {
        // Split the node's current class names
        var classes = node.className.split(' ');

        // Check if the class has already been added
        if (classes.indexOf(className) === -1) {
            // Add the new class to the list of classes
            classes.push(className);

            // Join the classes together again, and set
            node.className = classes.join(' ');
        }
    }

    function removeClass (node, className) {
        // Split the node's current class names
        var classes = node.className.split(' ');

        // Keep removing a class from the element until the class
        // does not exist in the classList of the node.
        var index;
        while ((index = classes.indexOf(className)) > -1) {
            // Remove the class by index
            classes.splice(index, 1);
        }

        // Join the classes together again, and set
        node.className = classes.join(' ');
    }

    function modifyClass (node, className, add) {
        if (add) {
            // If we want to add the class, call addClass
            addClass(node, className);
        } else {
            // If we want to remove the class, call removeClass
            removeClass(node, className);
        }
    }

    function extend (obj, other) {
        // Perform a shallow merge on the first object
        for (var key in other) {
            // Make sure we're not dealing with inherited props
            if (other.hasOwnProperty(key)) {
                obj[key] = other[key];
            }
        }

        // Return the main object
        return obj;
    }

    function parseUrl (url) {
        // Create an anchor element + set href
        var link = document.createElement('a');
        link.href = url;

        // Extract the formatted url from the element
        return link.href;
    }

    function getParams (items) {
        // Store a list of the url segments
        var parts = [];

        // Iterate over each item in the object
        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                // Construct a valid url segment (parsed)
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(items[key]));
            }
        }

        // Join the url segments together with &amp;
        return parts.join('&');
    }

    function getChatUrl () {
        // Get the domain that the HipChat server sits on & the room
        // key (must be set, or HipChat throws a hissy).
        var domain = getOption('domain', 'http://www.hipchat.com');
        var key = getOption('key', '');

        // Serialise the search parameters to pass through
        var params = getParams({
            anonymous: true,
            minimal: true,
            timezone: getOption('timezone', getTimezone()),
            'welcome_msg': getOption('message', '')
        });

        // Construct the valid HipChat room url
        return parseUrl(domain + '/' + key + '?' + params);
    }

    function needsUpdate (opt) {
        // Check if the old option is not the same as the new one
        return old[opt] !== options[opt] || firstUpdate;
    }

    function registerEvents () {
        // Find the element which triggers the open/close function
        var headingElement = findElement('heading');

        // Attach an event that switches show/hide the config on/off
        addEvent(headingElement, 'click', function () {
            self.config({ open: ! options.open });
        });
    }

    function invokeCallback (cb, def) {
        // If something other than a function is passed, use the noop
        if (typeof cb !== 'function') {
            cb = noop;
        }

        // Return whatever returns from the callback or if that was
        // undefined (ie. noop or function that returns nothing), use
        // the default value provided.
        var value = cb.call(null);
        return typeof value !== 'undefined' ? value : def;
    }

    function getOption (key, def) {
        if (typeof options[key] !== 'undefined') {
            // If the option has been defined, return value
            return options[key];
        } else {
            // The option does not exist, return the default
            return def;
        }
    }

    function updateAnimations (value) {
        modifyClass(domElement, 'hipbox-animate', value);
    }

    function updateOpen (value) {
        // Get the callback which hooks into the open/close action
        var beforeFunc = value ? options.beforeOpen : options.beforeClose;

        // See if the callback allows the method, default allow
        var allowAction = invokeCallback(beforeFunc, true);

        if (allowAction) {
            // Tell the host that the box is now open, ignore return value
            var afterFunc = value ? options.whenOpen : options.whenClose;
            invokeCallback(afterFunc);

            // Toggle the open class based on if we want to open/close
            modifyClass(domElement, 'hipbox-open', value);

            // TODO Shift out of here, should be else ware
            // Handle setting the frame source url on first open
            var frameElement = findElement('frame');
            var chatUrl = getChatUrl();
            var urlChanged = frameElement.src !== chatUrl;

            // Set the frames url, if we're opening, and the url
            // is set to changed.
            if (value && urlChanged) {
                frameElement.src = chatUrl;
            }
        } else {
            // If the action was rejected by the host, set the option back
            options.open = old.open || false;
        }
    }

    function updateTitle (value) {
        var titleElement = findElement('title');
        // Parse the input as text + set as title content
        titleElement.innerHTML = parseText(value);
    }

    function updateCaption (value) {
        var captionElement = findElement('caption');
        // Parse the input as text + set as caption content
        captionElement.innerHTML = parseText(value);
    }

    function updatePosition (value) {
        // Parse the input as a valid hipchat-* class to apply positional styling
        var positionSuffix = value.replace(' ', '-');
        addClass(domElement, 'hipbox-' + positionSuffix);
    }

    function updateHeight (value) {
        var contentElement = findElement('content');
        // Set the height of the Hipbox content div
        contentElement.style.height = value + 'px';
    }

    function updateWidth (value) {
        var contentElement = findElement('content');
        // Set the width of the Hipbox content div
        contentElement.style.width = value + 'px';
    }

    function updateDom () {
        if (firstUpdate) {
            // If there has not yet been a push to the dom, push the
            // Hipbox elements to the dom (once the dom has finished loading).
            whenReady(function () {
                // Add the dom element to the body
                document.body.appendChild(domElement);

                // Register the events
                registerEvents();
            });

            // We've successfully updated the dom, prevent unwanted updates
            firstUpdate = false;
        }
    }

    function update () {
        if (needsUpdate('animations')) {
            updateAnimations(getOption('animations', true));
        }

        if (needsUpdate('open')) {
            updateOpen(getOption('open', false));
        }

        if (needsUpdate('title')) {
            updateTitle(getOption('title', ''));
        }

        if (needsUpdate('caption')) {
            updateCaption(getOption('caption', ''));
        }

        if (needsUpdate('position')) {
            updatePosition(getOption('position', 'bottom right'));
        }

        if (needsUpdate('height')) {
            updateHeight(getOption('height', 500));
        }

        if (needsUpdate('width')) {
            updateWidth(getOption('width', 400));
        }

        updateDom();
    }

    var domElement = parseElement(
        '<div id="hb:container" class="hipbox">' +
            '<div id="hb:inner" class="hipbox-inner">' +
                '<div id="hb:heading" class="hipbox-heading">' +
                    '<h1 id="hb:title" class="hipbox-title"></h1>' +
                    '<p id="hb:caption" class="hipbox-caption"></p>' +
                '</div>' +
                '<div id="hb:content" class="hipbox-content">' +
                    '<iframe src="about:blank" id="hb:frame" class="hipbox-frame"></iframe>' +
                '</div>' +
            '</div>' +
        '</div>'
    );

    self.config = function (opts) {
        // Store the old options + new
        old = extend({}, options);
        extend(options, opts);

        // Update the view accordingly
        update();
    };

    return self;

});