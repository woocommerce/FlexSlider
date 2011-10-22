jQuery FlexSlider v1.8
http://flex.madebymufffin.com

Copyright (c) 2011 Tyler Smith

---

Changelog:
v1.8 (2011-10-22)
  - CSS3 transform3d support for webkit browsers coupled with 1-to-1 swiping has been introduced. The entire touch swipe experience has been vastly improved beyond comparison to previous versions.
  - New resize event handling to nix the old behavior. Slides not stay in place, rather than moving around and then sliding back.
  - Added "slideDirection" property to support "vertical" or "horizontal" sliding directions
  - Added "mousewheel" property to support mousewheel scrolling of slide elements.
  - Added "slider.manualPause" that is set by the pausePlay element and can be set via the callback API. This will prevent pauseOnHover from resuming on hover exit.
  - Removed "touchswipe" property as a customizable options.
  - Fixed behavior in slides with only two slides. Scrolling should happen as intended.
  - Fixed pausePlay element bind to trigger both touchstart and click.
  - Note: A destroy function has been added to the main plugin file, but is commented out and omitted from the minified version. Those interested can find the function and documentation to implement a custom destroy function based on their own needs/event triggers.

v1.7 (2011-09-10)
  - Callback API features with start(), before(), after(), and end() options. All functions should include one parameter for the slider element. (ex. start: function(slider) {})
  - Crossfade has been introduced through new CSS techniques
  - pausePlay property added to support a dynamic pause/play element
  - animationLoop property added to support non-looping sliders
  - FlexSlider CSS further improved, including IE hacks to improve cross-browser design integrity
--

v1.6 (2011-08-30)
  - Vast improvements to the plugin architecture
  - Multiple instances of FlexSlider are now possible. (Please, consider your audience before going crazy with this)
  - Removed the "show" animation option in interest of other things. Use animationDuration: 0, if needed.
  - FlexSlider CSS has been updated. Use the v1.6 stylesheet!
--

v1.5 (2011-08-27)
	- Improved mobile support by adding "touchstart" to bound events
	- Implemented solution for no javascript fallback (relies on user, and prepares for html5 boilerplate/modernizr classes)
--

v1.4 (2011-08-23)
  - Added "manualControls" property to allow for custom, non-dynamic control navigation
  - Added "show" animation to allow for instant transitions between slides
--

v1.3 (2011-08-18)
  - Made slide animation a continuous scroll effect, rather than jumping back to start/end
  - Cleaned up code and created better test cases for different slider scenarios. The slider is a lot more bulletproof as of this update.
--

v1.2 (2011-08-16)
  - Fixed some code redundancies
  - Added "randomize" property to randomize slide oder on pageLoad
  - Added "touchSwipe" property for swipe gestures on iOS and Android devices (no Android device to test this, but it should work)
  - Fixed minor bugs in jQuery 1.3.2 where navigation was not appending correctly
--

v1.0 2011-08-14 (Release)
  - Free to use under the MIT license