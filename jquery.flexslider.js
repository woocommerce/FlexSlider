/*
 * jQuery FlexSlider v1.4
 * http://flex.madebymufffin.com
 *
 * Copyright 2011, Tyler Smith
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * TouchWipe gesture credits: http://www.netcu.de/jquery-touchwipe-iphone-ipad-library
 */


(function ($) {
  $.fn.extend({
    flexslider: function(options) {
      //Plugin options and their default values
      var defaults = {
        animation: "fade",              //Select your animation type (fade/slide/show)
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
			
			//Get slider, slides, and other useful variables
			var options =  $.extend(defaults, options),
			    slider = this,
			    container = $('.slides', slider),
			    slides = $('.slides li', slider),
			    length = slides.length;
			    ANIMATING = false,
          currentSlide = options.slideToStart;
      
      
      ///////////////////////////////////////////////////////////////////
      // FLEXSLIDER: RANDOMIZE SLIDES
      if (options.randomize && length > 1) {
        slides.sort(function() { return (Math.round(Math.random())-0.5); });
        container.empty().append(slides);
      }
      ///////////////////////////////////////////////////////////////////
      
      
      //Slider animation initialize
      if (options.animation.toLowerCase() == "slide" && length > 1) {
        slider.css({"overflow": "hidden"});
        
        container.append(slides.filter(':first').clone().addClass('clone')).prepend(slides.filter(':last').clone().addClass('clone'));
        container.width(((length + 2) * slider.width()) + 2000); //extra width to account for quirks
        
        //Timeout function to give browser enough time to get proper width initially
        var newSlides = $('.slides li', slider);
        setTimeout(function() {
          newSlides.width(slider.width()).css({"float": "left"}).show();
        }, 100);

        container.css({"marginLeft": (-1 * (currentSlide + 1))* slider.width() + "px"});
        
      } else { //Default to fade
        slides.hide().eq(currentSlide).fadeIn(400);
      }
      	
    	///////////////////////////////////////////////////////////////////
    	// FLEXSLIDER: ANIMATION TYPE
    	function flexAnimate(target) {
        if (!ANIMATING) {
          ANIMATING = true;
          if (options.animation.toLowerCase() == "slide") {
            if (currentSlide == 0 && target == length - 1) {
              container.animate({"marginLeft": "0px"}, options.animationDuration, function(){
        	      container.css({"marginLeft": (-1 * length) * slides.filter(':first').width() + "px"});
        	      ANIMATING = false;
        	      currentSlide = target;
        	    });
            } else if (currentSlide == length - 1 && target == 0) {
              container.animate({"marginLeft": (-1 * (length + 1)) * slides.filter(':first').width() + "px"}, options.animationDuration, function(){
        	      container.css({"marginLeft": -1 * slides.filter(':first').width() + "px"});
        	      ANIMATING = false;
        	      currentSlide = target;
        	    });
            } else {
              container.animate({"marginLeft": (-1 * (target + 1)) * slides.filter(':first').width() + "px"}, options.animationDuration, function(){
        	      ANIMATING = false;
        	      currentSlide = target;
        	    });
            }
        	} else if (options.animation.toLowerCase() == "show") {
            
            slides.eq(currentSlide).hide();
            slides.eq(target).show();
            ANIMATING = false;
            currentSlide = target;
            
        	} else { //Default to Fade
        	  slider.css({"minHeight": slides.eq(currentSlide).height()});
      	    slides.eq(currentSlide).fadeOut(options.animationDuration, function() {
              slides.eq(target).fadeIn(options.animationDuration, function() {
                ANIMATING = false;
                currentSlide = target;
              });
              slider.css({"minHeight": "inherit"});
            });
        	}
      	}
  	  }
    	///////////////////////////////////////////////////////////////////
    	
    	///////////////////////////////////////////////////////////////////
    	// FLEXSLIDER: CONTROL NAV
      if (options.controlNav && length > 1) {
        if (options.manualControls != "" && $(options.manualControls).length > 0) {
          var controlNav = $(options.manualControls);
        } else {
          var controlNav = $('<ol class="flex-control-nav"></ol>');
          var j = 1;
          for (var i = 0; i < length; i++) {
            controlNav.append('<li><a>' + j + '</a></li>');
            j++;
          }
          
          //extra children check for jquery 1.3.2 - Drupal 6
          if (options.controlsContainer != "" && $(options.controlsContainer).length > 0) {
            $(options.controlsContainer).append(controlNav);
          } else {
            slider.append(controlNav);
          }
          
          controlNav = $('.flex-control-nav li a'); 
        }
        
        controlNav.eq(currentSlide).addClass('active');

        controlNav.click(function(event) {
          event.preventDefault(); 
          
          if ($(this).hasClass('active') || ANIMATING) {
            return;
          } else {

            controlNav.removeClass('active');
            $(this).addClass('active');
            
            var selected = controlNav.index($(this));
            flexAnimate(selected);
            if (options.pauseOnAction) {
              clearInterval(animatedSlides);
            }
          }
        });
      }
      ///////////////////////////////////////////////////////////////////
      
      //////////////////////////////////////////////////////////////////
      //FLEXSLIDER: DIRECTION NAV
      if (options.directionNav && length > 1) {
        //Create and append the nav
        if (options.controlsContainer != "" && $(options.controlsContainer).length > 0) {
            $(options.controlsContainer).append($('<ul class="flex-direction-nav"><li><a class="prev" href="#">' + options.prevText + '</a></li><li><a class="next" href="#">' + options.nextText + '</a></li></ul>'));
          } else {
            slider.append($('<ul class="flex-direction-nav"><li><a class="prev" href="#">' + options.prevText + '</a></li><li><a class="next" href="#">' + options.nextText + '</a></li></ul>'));
          }
      
      	$('.flex-direction-nav li a').click(function(event) {
      	  event.preventDefault();
      	  if (ANIMATING) {
      	    return;
      	  } else {
        	  
        	  if ($(this).hasClass('next')) {
        	    var target = (currentSlide == length - 1) ? 0 : currentSlide + 1;
        	  } else {
        	    var target = (currentSlide == 0) ? length - 1 : currentSlide - 1;
        	  }
            
            if (options.controlNav) {
          	  controlNav.removeClass('active');
          	  controlNav.eq(target).addClass('active');
      	    }
      	    
        	  flexAnimate(target);
        	  if (options.pauseOnAction) {
              clearInterval(animatedSlides);
            }
          }
      	});
      }
    	//////////////////////////////////////////////////////////////////

      //////////////////////////////////////////////////////////////////
      //FLEXSLIDER: KEYBOARD NAV
      if (options.keyboardNav && length > 1) {
        $(document).keyup(function(event) {
          if (ANIMATING) {
            return;
          } else if (event.keyCode != 39 && event.keyCode != 37){
            return;
          } else {
            
            if (event.keyCode == 39) {
        	    var target = (currentSlide == length - 1) ? 0 : currentSlide + 1;
        	  } else if (event.keyCode == 37){
        	    var target = (currentSlide == 0) ? length - 1 : currentSlide - 1;
        	  }
      	  
        	  if (options.controlNav) {
          	  controlNav.removeClass('active');
          	  controlNav.eq(target).addClass('active');
      	    }
      	  
        	  flexAnimate(target);
        	  if (options.pauseOnAction) {
              clearInterval(animatedSlides);
            }
          }
        });
      }
    	//////////////////////////////////////////////////////////////////
    	
    	//////////////////////////////////////////////////////////////////
      //FLEXSLIDER: ANIMATION SLIDESHOW
      if (options.slideshow && length > 1) {
        var animatedSlides;
        
        function animateSlides() {
          if (ANIMATING) {
            return;
          } else {
        	  var target = (currentSlide == length - 1) ? 0 : currentSlide + 1;
      	  
        	  if (options.controlNav) {
          	  controlNav.removeClass('active');
          	  controlNav.eq(target).addClass('active');
      	    }
      	  
        	  flexAnimate(target);
          }
        }
        
        //pauseOnHover
        if (options.pauseOnHover) {
          slider.hover(function() {
            clearInterval(animatedSlides);
          }, function() {
            animatedSlides = setInterval(animateSlides, options.slideshowSpeed);
          });
        }
        
        //Initialize animation
        if (length > 1) {
          animatedSlides = setInterval(animateSlides, options.slideshowSpeed);
        }
      }
    	//////////////////////////////////////////////////////////////////

			//////////////////////////////////////////////////////////////////
      //FLEXSLIDER: TOUCHSWIPE GESTURES
      //Credit of concept: TouchSwipe - http://www.netcu.de/jquery-touchwipe-iphone-ipad-library
      if (options.touchSwipe && 'ontouchstart' in document.documentElement && length > 1) {
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
                	var target = (currentSlide == length - 1) ? 0 : currentSlide + 1;
                }
                else {
                	var target = (currentSlide == 0) ? length - 1 : currentSlide - 1;
                }
            
                if (options.controlNav) {
              	  controlNav.removeClass('active');
              	  controlNav.eq(target).addClass('active');
                 }
                 
                flexAnimate(target);
                if (options.pauseOnAction) {
                  clearInterval(animatedSlides);
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
      if (options.animation.toLowerCase() == "slide" && length > 1) {
        var sliderTimer;
        $(window).resize(function(){
          newSlides.width(slider.width());
          //clones.width(slider.width());
          container.width(((length + 2) * slider.width()) + 2000); //extra width to account for quirks
          
          //slider resize reset
          clearTimeout(sliderTimer);
          sliderTimer = setTimeout(function(){
            flexAnimate(currentSlide);
          }, 300);
        });
      }
      //////////////////////////////////////////////////////////////////
	  }
  });
  
})(jQuery);