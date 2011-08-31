/*
 * jQuery FlexSlider v1.6
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
      slider.eventType = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
      
      if (slider.vars.controlsContainer != "") {
        slider.controlsContainer = $(slider.vars.controlsContainer).eq($('.slides').index(slider.container));
        slider.containerExists = slider.controlsContainer.length > 0;
      }
      
      if (slider.vars.manualControls != "") {
        if (slider.containerExists) {
          slider.manualControls = $(slider.vars.manualControls, slider.controlsContainer);
        } else {
          slider.manualControls = $(slider.vars.manualControls, slider);
        }
        slider.manualExists = slider.manualControls.length > 0;
      }
      
      ///////////////////////////////////////////////////////////////////
      // FLEXSLIDER: RANDOMIZE SLIDES
      if (slider.vars.randomize && slider.count > 1) {
        slider.slides.sort(function() { return (Math.round(Math.random())-0.5); });
        slider.container.empty().append(slider.slides);
      }
      ///////////////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////////////
      // FLEXSLIDER: Slider animation initialize
      if (slider.vars.animation.toLowerCase() == "slide" && slider.count > 1) {
        slider.css({"overflow": "hidden"});

        slider.container.append(slider.slides.filter(':first').clone().addClass('clone')).prepend(slider.slides.filter(':last').clone().addClass('clone'));
        slider.container.width(((slider.count + 2) * slider.width()) + 2000); //extra width to account for quirks

        //Timeout function to give browser enough time to get proper width initially
        slider.newSlides = $('.slides > li', slider);
        setTimeout(function() {
          slider.newSlides.width(slider.width()).css({"float": "left"}).show();
        }, 100);

        slider.container.css({"marginLeft": (-1 * (slider.currentSlide + 1))* slider.width() + "px"});

      } else { //Default to fade
        slider.slides.hide().eq(slider.currentSlide).fadeIn(400);
      }
      ///////////////////////////////////////////////////////////////////
      
      ///////////////////////////////////////////////////////////////////
      // FLEXSLIDER: CONTROL NAV
      if (slider.vars.controlNav && slider.count > 1) {
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

          if (!($(this).hasClass('active') || slider.animating)) {

            slider.controlNav.removeClass('active');
            $(this).addClass('active');

            var selected = slider.controlNav.index($(this));
            slider.flexAnimate(selected);
            if (slider.vars.pauseOnAction) {
              clearInterval(slider.animatedSlides);
            }
          }
        });
      }
      ///////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FLEXSLIDER: DIRECTION NAV
      if (slider.vars.directionNav && slider.count > 1) {
        //Create and append the nav
        if (slider.containerExists) {
            $(slider.controlsContainer).append($('<ul class="flex-direction-nav"><li><a class="prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="next" href="#">' + slider.vars.nextText + '</a></li></ul>'));
            slider.directionNav = $('.flex-direction-nav li a', slider.controlsContainer);
        } else {
          slider.append($('<ul class="flex-direction-nav"><li><a class="prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="next" href="#">' + slider.vars.nextText + '</a></li></ul>'));
          slider.directionNav = $('.flex-direction-nav li a', slider);
        }
        
        slider.directionNav.bind(slider.eventType, function(event) {
          event.preventDefault();
          if (slider.animating) {
            return;
          } else {
          
            if ($(this).hasClass('next')) {
              var target = (slider.currentSlide == slider.count - 1) ? 0 : slider.currentSlide + 1;
            } else {
              var target = (slider.currentSlide == 0) ? slider.count - 1 : slider.currentSlide - 1;
            }

            if (slider.vars.controlNav) {
              slider.controlNav.removeClass('active');
              slider.controlNav.eq(target).addClass('active');
            }
        
            slider.flexAnimate(target);
            if (slider.vars.pauseOnAction) {
              clearInterval(slider.animatedSlides);
            }
          }
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FLEXSLIDER: KEYBOARD NAV
      if (slider.vars.keyboardNav && slider.count > 1 && $('ul.slides').length == 1) {
        $(document).keyup(function(event) {
          if (slider.animating) {
            return;
          } else if (event.keyCode != 39 && event.keyCode != 37){
            return;
          } else {

            if (event.keyCode == 39) {
              var target = (slider.currentSlide == slider.count - 1) ? 0 : slider.currentSlide + 1;
            } else if (event.keyCode == 37){
              var target = (slider.currentSlide == 0) ? slider.count - 1 : slider.currentSlide - 1;
            }
        
            if (slider.vars.controlNav) {
              slider.controlNav.removeClass('active');
              slider.controlNav.eq(target).addClass('active');
            }
        
            slider.flexAnimate(target);
            if (slider.vars.pauseOnAction) {
              clearInterval(slider.animatedSlides);
            }
          }
        });
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FLEXSLIDER: ANIMATION SLIDESHOW
      if (slider.vars.slideshow) {
        slider.animatedSlides;

        //pauseOnHover
        if (slider.vars.pauseOnHover && slider.vars.slideshow) {
          slider.hover(function() {
            clearInterval(slider.animatedSlides);
          }, function() {
            slider.animatedSlides = setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
          });
        }

        //Initialize animation
        if (slider.count > 1) {
          slider.animatedSlides = setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
        }
      }
      //////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FLEXSLIDER: TOUCHSWIPE GESTURES
      //Credit of concept: TouchSwipe - http://www.netcu.de/jquery-touchwipe-iphone-ipad-library
      if (slider.vars.touchSwipe && 'ontouchstart' in document.documentElement && slider.count > 1) {
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
                if(dx > 0) {
                  var target = (slider.currentSlide == slider.count - 1) ? 0 : slider.currentSlide + 1;
                }
                else {
                  var target = (slider.currentSlide == 0) ? slider.count - 1 : slider.currentSlide - 1;
                }

                if (slider.vars.controlNav) {
                  slider.controlNav.removeClass('active');
                  slider.controlNav.eq(target).addClass('active');
                 }

                slider.flexAnimate(target);
                if (slider.vars.pauseOnAction) {
                  clearInterval(slider.animatedSlides);
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
      //FLEXSLIDER: RESIZE FUNCTIONS (If necessary)
      if (slider.vars.animation.toLowerCase() == "slide" && slider.count > 1) {
        slider.sliderTimer;
        $(window).resize(function(){
          slider.newSlides.width(slider.width());
          slider.container.width(((slider.count + 2) * slider.width()) + 2000); //extra width to account for quirks
    
          //slider resize reset
          clearTimeout(slider.sliderTimer);
          slider.sliderTimer = setTimeout(function(){
            slider.flexAnimate(slider.currentSlide);
          }, 300);
        });
      }
      //////////////////////////////////////////////////////////////////
      
    }
    
    //FlexSlider: Animation Actions
    slider.flexAnimate = function(target) {
      if (!slider.animating) {
        slider.animating = true;
        if (slider.vars.animation.toLowerCase() == "slide") {
          if (slider.currentSlide == 0 && target == slider.count - 1) {
            slider.container.animate({"marginLeft": "0px"}, slider.vars.animationDuration, function(){
              slider.container.css({"marginLeft": (-1 * slider.count) * slider.slides.filter(':first').width() + "px"});
              slider.animating = false;
              slider.currentSlide = target;
            });
          } else if (slider.currentSlide == slider.count - 1 && target == 0) {
            slider.container.animate({"marginLeft": (-1 * (slider.count + 1)) * slider.slides.filter(':first').width() + "px"}, slider.vars.animationDuration, function(){
              slider.container.css({"marginLeft": -1 * slider.slides.filter(':first').width() + "px"});
              slider.animating = false;
              slider.currentSlide = target;
            });
          } else {
            slider.container.animate({"marginLeft": (-1 * (target + 1)) * slider.slides.filter(':first').width() + "px"}, slider.vars.animationDuration, function(){
              slider.animating = false;
              slider.currentSlide = target;
            });
          }
        } else { //Default to Fade
          slider.css({"minHeight": slider.slides.eq(slider.currentSlide).height()});
          slider.slides.eq(slider.currentSlide).fadeOut(slider.vars.animationDuration, function() {
            slider.slides.eq(target).fadeIn(slider.vars.animationDuration, function() {
              slider.animating = false;
              slider.currentSlide = target;
            });
            slider.css({"minHeight": "inherit"});
          });
        }
      }
    }
    
    //FlexSlider: Automatic Slideshow
    slider.animateSlides = function() {
      if (slider.animating) {
        return;
      } else {
        var target = (slider.currentSlide == slider.count - 1) ? 0 : slider.currentSlide + 1;
        if (slider.vars.controlNav) {
          slider.controlNav.removeClass('active');
          slider.controlNav.eq(target).addClass('active');
        }
        slider.flexAnimate(target);
      }
    }
    
    slider.init();
  }
  
  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    animation: "fade",              //Select your animation type (fade/slide)
    slideshow: true,                //Should the slider animate automatically by default? (true/false)
    slideshowSpeed: 7000,           //Set the speed of the slideshow cycling, in milliseconds
    animationDuration: 500,         //Set the speed of animations, in milliseconds
    directionNav: true,             //Create navigation for previous/next navigation? (true/false)
    controlNav: true,               //Create navigation for paging control of each clide? (true/false)
    keyboardNav: true,              //Allow for keyboard navigation using left/right keys (true/false)
    touchSwipe: true,               //Touch swipe gestures for left/right slide navigation (true/false)
    prevText: "Previous",           //Set the text for the "previous" directionNav item
    nextText: "Next",               //Set the text for the "next" directionNav item
    randomize: false,               //Randomize slide order on page load? (true/false)
    slideToStart: 0,                //The slide that the slider should start on. Array notation (0 = first slide)
    pauseOnAction: true,            //Pause the slideshow when interacting with control elements, highly recommended. (true/false)
    pauseOnHover: false,            //Pause the slideshow when hovering over slider, then resume when no longer hovering (true/false)
    controlsContainer: "",          //Advanced property: Can declare which container the navigation elements should be appended too. Default container is the flexSlider element. Example use would be ".flexslider-container", "#container", etc. If the given element is not found, the default action will be taken.
    manualControls: ""              //Advanced property: Can declare custom control navigation. Example would be ".flex-control-nav" or "#tabs-nav", etc. The number of elements in your controlNav should match the number of slides/tabs (obviously).
  }
  
  //FlexSlider: Primary Function
  $.fn.flexslider = function(options) {
    return this.each(function() {
      if ($(this).data('flexslider') != true) {
        new $.flexslider($(this), options);
      }
    });
  }  

})(jQuery);