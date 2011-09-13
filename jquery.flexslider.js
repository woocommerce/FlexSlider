/*
 * jQuery FlexSlider v1.7
 * http://flex.madebymufffin.com
 *
 * Copyright 2011, Tyler Smith
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Shoutout to Darin Richardson for his wonderful contributions to the betterment of FlexSlider
 */

;(function ($) {
  
  //FlexSlider: Object Instance
  $.flexslider = function(el, options) {
    var slider = el;

    slider.init = function() {
      slider.vars = $.extend({}, $.flexslider.defaults, options);
      slider.data('flexslider', true);
      slider.container = $('.slides', slider);
      slider.slides = $('.slides > li', slider);
      slider.count = slider.slides.length;
      slider.animating = false;
      slider.currentSlide = slider.vars.slideToStart;
      slider.atEnd = (slider.currentSlide == 0) ? true : false;
      slider.eventType = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
      slider.cloneCount = 0;
      slider.cloneOffset = 0;
      
      //Test for controlsContainer
      if (slider.vars.controlsContainer != "") {
        slider.controlsContainer = $(slider.vars.controlsContainer).eq($('.slides').index(slider.container));
        slider.containerExists = slider.controlsContainer.length > 0;
      }
      //Test for manualControls
      if (slider.vars.manualControls != "") {
        slider.manualControls = $(slider.vars.manualControls, ((slider.containerExists) ? slider.controlsContainer : slider));
        slider.manualExists = slider.manualControls.length > 0;
      }
      
      ///////////////////////////////////////////////////////////////////
      // FlexSlider: Randomize Slides
      if (slider.vars.randomize) {
        slider.slides.sort(function() { return (Math.round(Math.random())-0.5); });
        slider.container.empty().append(slider.slides);
      }
      ///////////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////////
      // FlexSlider: Slider Animation Initialize
      if (slider.vars.animation.toLowerCase() == "slide") {
        slider.css({"overflow": "hidden"});
        if (slider.vars.animationLoop) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          slider.container.append(slider.slides.filter(':first').clone().addClass('clone')).prepend(slider.slides.filter(':last').clone().addClass('clone'));
        }
        slider.container.width(((slider.count + slider.cloneCount) * slider.width()) + 2000); //extra width to account for quirks
        //create newSlides to capture possible clones
        slider.newSlides = $('.slides > li', slider);
        //Timeout function to give browser enough time to get proper width initially
        setTimeout(function() {
          slider.newSlides.width(slider.width()).css({"float": "left"}).show();
        }, 100);
        slider.container.css({"marginLeft": (-1 * (slider.currentSlide + slider.cloneOffset))* slider.width() + "px"});
      } else { //Default to fade
        slider.slides.css({"width": "100%", "float": "left", "marginRight": "-100%"}).filter(':first').fadeIn(400, function() {
        });
      }
      ///////////////////////////////////////////////////////////////////
      
      ///////////////////////////////////////////////////////////////////
      // FlexSlider: Control Nav
      if (slider.vars.controlNav) {
        if (slider.manualExists) {
          slider.controlNav = slider.manualControls;
        } else {
          var controlNavScaffold = $('<ol class="flex-control-nav"></ol>');
          var j = 1;
          for (var i = 0; i < slider.count; i++) {
            controlNavScaffold.append('<li><a>' + j + '</a></li>');
            j++;
          }

          if (slider.containerExists) {
            $(slider.controlsContainer).append(controlNavScaffold);
            slider.controlNav = $('.flex-control-nav li a', slider.controlsContainer);
          } else {
            slider.append(controlNavScaffold);
            slider.controlNav = $('.flex-control-nav li a', slider);
          }
        }

        slider.controlNav.eq(slider.currentSlide).addClass('active');

        slider.controlNav.bind(slider.eventType, function(event) {
          event.preventDefault();
          if (!$(this).hasClass('active')) {
            slider.flexAnimate(slider.controlNav.index($(this)), slider.vars.pauseOnAction);
          }
        });
      }
      ///////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FlexSlider: Direction Nav
      if (slider.vars.directionNav) {
        var directionNavScaffold = $('<ul class="flex-direction-nav"><li><a class="prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="next" href="#">' + slider.vars.nextText + '</a></li></ul>');
        
        if (slider.containerExists) {
          $(slider.controlsContainer).append(directionNavScaffold);
          slider.directionNav = $('.flex-direction-nav li a', slider.controlsContainer);
        } else {
          slider.append(directionNavScaffold);
          slider.directionNav = $('.flex-direction-nav li a', slider);
        }
        
        //Set initial disable styles if necessary
        if (!slider.vars.animationLoop) {
          if (slider.currentSlide == 0) {
            slider.directionNav.filter('.prev').addClass('disabled');
          } else if (slider.currentSlide == slider.count - 1) {
            slider.directionNav.filter('.next').addClass('disabled');
          }
        }
        
        slider.directionNav.bind(slider.eventType, function(event) {
          event.preventDefault();
          var target = ($(this).hasClass('next')) ? slider.getTarget('next') : slider.getTarget('prev');
          
          if (slider.canAdvance(target)) {
            slider.flexAnimate(target, slider.vars.pauseOnAction);
          }
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FlexSlider: Keyboard Nav
      if (slider.vars.keyboardNav && $('ul.slides').length == 1) {
        $(document).keyup(function(event) {
          if (slider.animating) {
            return;
          } else if (event.keyCode != 39 && event.keyCode != 37){
            return;
          } else {
            if (event.keyCode == 39) {
              var target = slider.getTarget('next');
            } else if (event.keyCode == 37){
              var target = slider.getTarget('prev');
            }
        
            if (slider.canAdvance(target)) {
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
          }
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FlexSlider: Slideshow Setup
      if (slider.vars.slideshow) {
        //pauseOnHover
        if (slider.vars.pauseOnHover && slider.vars.slideshow) {
          slider.hover(function() {
            slider.pause();
          }, function() {
            slider.resume();
          });
        }

        //Initialize animation
        slider.animatedSlides = setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FlexSlider: Pause/Play
      if (slider.vars.pausePlay) {
        var pausePlayScaffold = $('<div class="flex-pauseplay"><span></span></div>');
      
        if (slider.containerExists) {
          slider.controlsContainer.append(pausePlayScaffold);
          slider.pausePlay = $('.flex-pauseplay span', slider.controlsContainer);
        } else {
          slider.append(pausePlayScaffold);
          slider.pausePlay = $('.flex-pauseplay li a', slider);
        }
        
        var pausePlayState = (slider.vars.slideshow) ? 'pause' : 'play';
        slider.pausePlay.addClass(pausePlayState).text(pausePlayState);
        
        slider.pausePlay.click(function(event) {
          event.preventDefault();
          ($(this).hasClass('pause'))? slider.pause() : slider.resume();
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FlexSlider:Touch Swip Gestures
      //Credit of concept: TouchSwipe - http://www.netcu.de/jquery-touchwipe-iphone-ipad-library
      if (slider.vars.touchSwipe && 'ontouchstart' in document.documentElement) {
        slider.each(function() {
          var startX,
              min_move_x = 20;
              isMoving = false;

          function cancelTouch() {
            this.removeEventListener('touchmove', onTouchMove);
            startX = null;
            isMoving = false;
          }
          function onTouchMove(e) {
            if (isMoving) {
              var x = e.touches[0].pageX,
                  dx = startX - x;
          
              if(Math.abs(dx) >= min_move_x) {
                cancelTouch();
                var target = (dx > 0) ? slider.getTarget('next') : slider.getTarget('prev');
                
                if (slider.canAdvance(target)) {
                  slider.flexAnimate(target, slider.vars.pauseOnAction);
                }
              }
            }
          }
          function onTouchStart(e) {
            if (e.touches.length == 1) {
              startX = e.touches[0].pageX;
              isMoving = true;
              this.addEventListener('touchmove', onTouchMove, false);
            }
          }
          if ('ontouchstart' in document.documentElement) {
            this.addEventListener('touchstart', onTouchStart, false);
          }
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FlexSlider: Resize Functions (If necessary)
      if (slider.vars.animation.toLowerCase() == "slide") {
        slider.sliderTimer;
        $(window).resize(function(){
          slider.newSlides.width(slider.width());
          slider.container.width(((slider.count + slider.cloneCount) * slider.width()) + 2000); //extra width to account for quirks
    
          //Slider resize reset
          clearTimeout(slider.sliderTimer);
          slider.sliderTimer = setTimeout(function(){
            slider.flexAnimate(slider.currentSlide);
          }, 300);
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //FlexSlider: start() Callback
      slider.vars.start(slider);
    }
    
    //FlexSlider: Animation Actions
    slider.flexAnimate = function(target, pause) {
      if (!slider.animating) {
        //Animating flag
        slider.animating = true;
        
        //Optional paramter to pause slider when making an anmiation call
        if (pause) {
          slider.pause();
        }
        
        //Update controlNav   
        if (slider.vars.controlNav) {
          slider.controlNav.removeClass('active').eq(target).addClass('active');
        }
        
        //Is the slider at either end
        slider.atEnd = (target == 0 || target == slider.count - 1) ? true : false;
        if (!slider.vars.animationLoop) {
          if (target == 0) {
            slider.directionNav.removeClass('disabled').filter('.prev').addClass('disabled');
          } else if (target == slider.count - 1) {
            slider.directionNav.removeClass('disabled').filter('.next').addClass('disabled');
            slider.pause();
            //FlexSlider: end() of cycle Callback
            slider.vars.end(slider);
          } else {
            slider.directionNav.removeClass('disabled');
          }
        }
        
        //FlexSlider: before() animation Callback
        slider.vars.before(slider);
        
        if (slider.vars.animation.toLowerCase() == "slide") {

          if (slider.currentSlide == 0 && target == slider.count - 1 && slider.vars.animationLoop) {
            slider.slideString = "0px";
          } else if (slider.currentSlide == slider.count - 1 && target == 0 && slider.vars.animationLoop) {
            slider.slideString = (-1 * (slider.count + 1)) * slider.slides.filter(':first').width() + "px";
          } else {
            slider.slideString = (-1 * (target + slider.cloneOffset)) * slider.slides.filter(':first').width() + "px";
          }
          slider.container.animate({"marginLeft": slider.slideString}, slider.vars.animationDuration, function(){
            //Jump the slider if necessary
            if (slider.currentSlide == 0 && target == slider.count - 1 && slider.vars.animationLoop) {
              slider.container.css({"marginLeft": (-1 * slider.count) * slider.slides.filter(':first').width() + "px"});
            } else if (slider.currentSlide == slider.count - 1 && target == 0 && slider.vars.animationLoop) {
              slider.container.css({"marginLeft": -1 * slider.slides.filter(':first').width() + "px"});
            }
            slider.animating = false;
            slider.currentSlide = target;
            //FlexSlider: after() animation Callback
            slider.vars.after(slider);
          });
        } else { //Default to Fade
          slider.slides.eq(slider.currentSlide).fadeOut(slider.vars.animationDuration);
          slider.slides.eq(target).fadeIn(slider.vars.animationDuration, function() {
            slider.animating = false;
            slider.currentSlide = target;
            //FlexSlider: after() animation Callback
            slider.vars.after(slider);
          });
        }
      }
    }
    
    //FlexSlider: Automatic Slideshow
    slider.animateSlides = function() {
      if (!slider.animating) {
        var target = (slider.currentSlide == slider.count - 1) ? 0 : slider.currentSlide + 1;
        slider.flexAnimate(target);
      }
    }
    
    //FlexSlider: Automatic Slideshow Pause
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      if (slider.vars.pausePlay) {
        slider.pausePlay.removeClass('pause').addClass('play').text('play');
      }
    }
    
    //FlexSlider: Automatic Slideshow Start/Resume
    slider.resume = function() {
      slider.animatedSlides = setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      if (slider.vars.pausePlay) {
        slider.pausePlay.removeClass('play').addClass('pause').text('pause');
      }
    }
    
    //FlexSlider: Helper function for non-looping sliders
    slider.canAdvance = function(target) {
      if (!slider.vars.animationLoop && slider.atEnd) {
        if (slider.currentSlide == 0 && target == slider.count - 1 && slider.direction != "next") {
          return false;
        } else if (slider.currentSlide == slider.count - 1 && target == 0 && slider.direction == "next") {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }  
    }
    
    //FlexSlider: Helper function to determine animation target
    slider.getTarget = function(dir) {
      slider.direction = dir;
      if (dir == "next") {
        return (slider.currentSlide == slider.count - 1) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide == 0) ? slider.count - 1 : slider.currentSlide - 1;
      }
    }
    
    //FlexSlider: Initialize
    slider.init();
  }
  
  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    animation: "fade",              //Select your animation type (fade/slide)
    slideshow: true,                //Should the slider animate automatically by default? (true/false)
    slideshowSpeed: 7000,           //Set the speed of the slideshow cycling, in milliseconds
    animationDuration: 600,         //Set the speed of animations, in milliseconds
    directionNav: true,             //Create navigation for previous/next navigation? (true/false)
    controlNav: true,               //Create navigation for paging control of each clide? (true/false)
    keyboardNav: true,              //Allow for keyboard navigation using left/right keys (true/false)
    touchSwipe: true,               //Touch swipe gestures for left/right slide navigation (true/false)
    prevText: "Previous",           //Set the text for the "previous" directionNav item
    nextText: "Next",               //Set the text for the "next" directionNav item
    pausePlay: false,               //Create pause/play dynamic element (true/false)
    randomize: false,               //Randomize slide order on page load? (true/false)
    slideToStart: 0,                //The slide that the slider should start on. Array notation (0 = first slide)
    animationLoop: true,            //Should the animation loop? If false, directionNav will received disabled classes when at either end (true/false)
    pauseOnAction: true,            //Pause the slideshow when interacting with control elements, highly recommended. (true/false)
    pauseOnHover: false,            //Pause the slideshow when hovering over slider, then resume when no longer hovering (true/false)
    controlsContainer: "",          //Advanced property: Can declare which container the navigation elements should be appended too. Default container is the flexSlider element. Example use would be ".flexslider-container", "#container", etc. If the given element is not found, the default action will be taken.
    manualControls: "",             //Advanced property: Can declare custom control navigation. Example would be ".flex-control-nav" or "#tabs-nav", etc. The number of elements in your controlNav should match the number of slides/tabs (obviously).
    start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
    before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function(){},            //Callback: function(slider) - Fires after each slider animation completes
    end: function(){}               //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
  }
  
  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    return this.each(function() {
      if ($(this).find('.slides li').length == 1) {
        $(this).find('.slides li').fadeIn(400);
      }
      else if ($(this).data('flexslider') != true) {
        new $.flexslider($(this), options);
      }
    });
  }  

})(jQuery);