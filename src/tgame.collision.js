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

tgame.collision = (function() {
  "use strict";

  return {
    rectangle: function(o1, o2) {
      var collision = null;
      var side = null;

      var half_width1 = o1.width * 0.5;
      var half_height1 = o1.height * 0.5;
      var center_x1 = o1.x + half_width1;
      var center_y1 = o1.y + half_height1;

      var half_width2 = o2.width * 0.5;
      var half_height2 = o2.height * 0.5;
      var center_x2 = o2.x + half_width2;
      var center_y2 = o2.y + half_height2;

      var dx = center_x2 - center_x1;
      var dy = center_y2 - center_y1;

      var abs_dx = Math.abs(dx);
      var abs_dy = Math.abs(dy);

      var half_width_total = half_width1 + half_width2;
      var half_height_total = half_height1 + half_height2;

      var overlap_x, overlap_y;

      if (abs_dx < half_width_total && abs_dy < half_height_total) {
        overlap_x = half_width_total - abs_dx;
        overlap_y = half_height_total - abs_dy;

        if (overlap_y < overlap_x) {
          side = dy > 0 ? "bottom" : "top";
        } else {
          side = dx > 0 ? "right" : "left";
        }

        collision = {
          dx: dx,
          dy: dy,
          side: side,
          overlap_x: overlap_x,
          overlap_y: overlap_y
        };
      }

      return collision;

    },
    circle: function(o1, o2) {
      var half_width1 = o1.width * 0.5;
      var half_height1 = o1.height * 0.5;
      var center_x1 = o1.x + half_width1;
      var center_y1 = o1.y + half_height1;

      var half_width2 = o2.width * 0.5;
      var half_height2 = o2.height * 0.5;
      var center_x2 = o2.x + half_width2;
      var center_y2 = o2.y + half_height2;

      var dx = center_x2 - center_x1;
      var dy = center_y2 - center_y1;
      
      return Math.sqrt(dx * dx + dy * dy) < half_width1 + half_width2;
    },
    blockCircle: function(o1, o2) {
      var half_width1 = o1.width * 0.5;
      var half_height1 = o1.height * 0.5;
      var center_x1 = o1.x + half_width1;
      var center_y1 = o1.y + half_height1;

      var half_width2 = o2.width * 0.5;
      var half_height2 = o2.height * 0.5;
      var center_x2 = o2.x + half_width2;
      var center_y2 = o2.y + half_height2;
      
      var dx = center_x2 - center_x1;
      var dy = center_y2 - center_y1;
      var d = Math.sqrt(dx * dx + dy * dy);
      
      var r_total = half_width1 + half_width2;
      var overlap;

      if (d < r_total) {
        overlap = r_total - d;

        o1.x -= overlap * dx / d;
        o1.y -= overlap * dy / d;
      }
    },
    blockRectangle: function(o1, o2) {
      var collision = tgame.collision.rectangle(o1, o2);

      if (collision) {
        ({
          top: function() { o1.y += collision.overlap_y; },
          bottom: function() { o1.y -= collision.overlap_y; },
          left: function() { o1.x += collision.overlap_x; },
          right: function() { o1.x -= collision.overlap_x; }
        })[collision.side]();
      }

      return collision;
    }
  };

})();