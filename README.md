Hipbox
======

A lightweight embeddable Hipchat box

Please note: this project is a work in progress, if you do decide to use it, please remember that the API is not final, and is subject to change at any point. The removal of features/functionality is also possible in dev versions.

Options
---

- **title** [String]

  The text to display in the heading within the button segment.

  *Note: HTML is stripped from this text by default, only text is allowed.*

- **caption** [String]

  The small text to display under the title.

  *Note: Also like the title option, this option only accepts text, HTML is stripped.*

- **message** [String]

  The message to display to a guest, when they enter your HipChat room.

- **key** [String]

  The key to your room.

- **position** [String]

  The position to display the chatbox on the users screen. Must be one of the following options; "top left", "top right", "bottom left", "bottom right". These options can also be seperated with a dash ("-") instead of a space.

- **timezone** [String] (Optional)

  The timezone in which HipChat uses to display timestamps. By default this is automatically detected, but if it cannot be, it falls back to "PST".

- **animations** [Boolean]

  Sets the CSS animations on/off. Default is set to true for browsers that support it.

- **domain** [String] (Experimental)

  The domain in which the HipChat server resides. Default is set to "http://www.hipchat.com".

- **width** [Number]

  The width of the chat window. There is no default, you *must* set one.

- **height** [Number]

  The height of the chat window. Again, there is no default, you *must* set one.

- **open** [Boolean]

  Whether the chat box is open by default. Default is set to false.

- **beforeOpen** [Function]

  A callback which expects a boolean in return. This callback is invoked every time the user/system requests the chat box to be opened.

  If false is returned, the chat box will not open.

- **beforeClose** [Function]

  Same as the beforeOpen callback, except this is invoked whenever the user/system attempts to close the chat box.

- **afterOpen** [Function]

  A callback which is invoked whenever the chat box is opened.

- **afterClose** [Function]

  Same as the afterOpen callback, but invoked whenever the chat box is closed.


Example
---

![Example Screenshot](https://raw.githubusercontent.com/iampseudo/hipbox/master/example/screenshot.png)