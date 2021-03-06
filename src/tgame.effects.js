///////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)
//
// Copyright (c) 2013 Tarek Sherif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

(function(tgame) {
  "use strict";

  tgame.effects = {
    fade: function(options) {
      options = options || {};
      var objects = options.objects || [];
      var multiplier = typeof options.multiplier === "number" ? options.multiplier : 0.9;
      var interval = typeof options.interval === "number" ? options.interval : 30;
      var delay = typeof options.delay === "number" ? options.delay : 0;
      var remove = options.remove || false;
      var callback = options.complete;
      var fadeFunction, filterFunction;

      if (multiplier > 1) {
        fadeFunction = fadeInFunction(multiplier, remove);
        filterFunction = filterFadeIn;
      } else {
        fadeFunction = fadeOutFunction(multiplier, remove);
        filterFunction = filterFadeOut;
      }

      setTimeout(function fade() {
        objects.forEach(fadeFunction);

        objects = objects.filter(filterFunction);
        if (objects.length > 0) {
          setTimeout(fade, interval);
        } else if (typeof callback === "function") {
          callback();
        }

      }, delay);
    }
  };


  function fadeInFunction(multiplier, remove) {
    return function(o) {
      if (o.alpha < 0.99) {
        o.alpha = o.alpha * multiplier || 0.01;
      } else {
        o.alpha = 1;
        if (remove) {
          o.remove = true;
        }
      }
    };
  }

  function fadeOutFunction(multiplier, remove) {
    return function(o) {
      if (o.alpha > 0.01) {
        o.alpha *= multiplier;
      } else {
        o.alpha = 0;
        if (remove) {
          o.remove = true;
        }
      }
    };
  }

  function filterFadeIn(o) { return o.alpha < 1; }
  function filterFadeOut(o) { return o.alpha > 0; }

})(tgame);
