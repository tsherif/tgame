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

(function() {
  "use strict";

  var canvas, context;
  var canvas_offset = {
    x: 0,
    y: 0
  };

  var asset_sources = [];
  var assets_loaded = 0;
  var frame_interval = 1000 / 60;

  var audio_extension = "";

  var keydown_handlers = {};
  var keyup_handlers = {};
  var render_order;
  var last_frame, current_frame;

  (function audioTest() {
    var audio = new Audio();
    var can_play = audio.canPlayType("audio/mpeg");
    if (can_play === "probably" || can_play === "maybe") {
      audio_extension = ".mp3";
      return;
    }

    can_play = audio.canPlayType("audio/ogg codecs='vorbis'");
    if (audio.canPlayType("audio/ogg codecs='vorbis'")) {
      audio_extension = ".ogg";
      return;
    }
  })();

  var tgame = window.tgame = {
    images: {},
    sounds: {},
    entities: {},
    state: null,
    camera: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    setFPS: function(fps) {
      frame_interval = 1000 / fps;
    },
    setCanvas: function(c) {
      canvas = c;
      context = canvas.getContext("2d");

      var offset_x = canvas.offsetLeft;
      var offset_y = canvas.offsetTop;
      var parent = canvas.offsetParent;
      while(parent.offsetParent) {
        offset_x += parent.offsetLeft;
        offset_y += parent.offsetTop;
        parent = parent.offSetParent;
      }

      canvas_offset.x = offset_x;
      canvas_offset.y = offset_y;
    },
    getCanvas: function() { return canvas; },
    getContext: function() { return context; },
    addImage: function(name, url) {
      addAsset(name, "image", url);
    },
    addSound: function(name, url) {
      addAsset(name, "sound", url);
    },
    addKeyControl: function(keycode, down, up) {
      keydown_handlers[keycode] = down;
      keyup_handlers[keycode] = up;
    },
    removeKeyControl: function(keycode) {
      keydown_handlers[keycode] = null;
      keyup_handlers[keycode] = null;
    },
    mouseDown: function(handler) {
      canvas.addEventListener("mousedown", function(event) {

        handler(event.clientX - canvas_offset.x, event.clientY - canvas_offset.y);
      }, false);
    },
    mouseMove: function(handler) {
      canvas.addEventListener("mousemove", function(event) {
        handler(event.clientX - canvas_offset.x, event.clientY - canvas_offset.y);
      }, false);
    },
    mouseUp: function(handler) {
      document.addEventListener("mouseup", function(event) {
        handler(event.clientX - canvas_offset.x, event.clientY - canvas_offset.y);
      }, false);
    },
    setRenderOrder: function(order) {
      render_order = order;
    },
    clearEntities: function() {
      var entities = arguments.length > 0 ? Array.prototype.slice.call(arguments) : Object.keys(tgame.entities);
      entities.forEach(function(type) {
        tgame.entities[type].length = 0;
      });
    },
    start: function() {
      render_order = render_order || Object.keys(tgame.entities);

      tgame.camera.width = tgame.camera.width || canvas.width;
      tgame.camera.height = tgame.camera.height || canvas.height;

      if (Object.keys(keydown_handlers).length > 0) {
        document.addEventListener("keydown", function(event) {
          if (keydown_handlers[event.keyCode]) {

            if (keydown_handlers[event.keyCode](event) !== false) {
              event.preventDefault();
            }
            
          }
        }, false);

        document.addEventListener("keyup", function(event) {
          if (keyup_handlers[event.keyCode]) {
            if (keyup_handlers[event.keyCode](event) !== false) {
              event.preventDefault();
            }
          }
        }, false);
      }
      if (asset_sources.length > 0) {
        loadAssets();
      } else {
        last_frame = Date.now();
        update();
      }
      
    }
  };

  var asset_handlers = {
    image: function(url, callback) {
      var image = new Image();
      image.addEventListener("load", callback);
      image.src = url;

      return image;
    },
    sound: function(url, callback) {
      var sound = new Audio(url + audio_extension);
      sound.addEventListener("canplaythrough", callback);
      sound.load();

      return sound;
    }
  };

  function addAsset(name, type, url) {
    asset_sources.push({
      name: name,
      type: type,
      url: url
    });
  }

  function loadAssets() {
    asset_sources.forEach(function(a) {
      tgame[a.type + "s"][a.name] = asset_handlers[a.type](a.url, function() {
        assets_loaded++;
        if (assets_loaded === asset_sources.length) {
          update();
        }
      });
    });
  }

  function update() {
    window.requestAnimationFrame(render);
    setTimeout(update, frame_interval);

    current_frame = Date.now();
    if (tgame.STATES.hasOwnProperty(tgame.state)) {
      tgame.STATES[tgame.state](current_frame - last_frame);
    }

    last_frame = current_frame;

    render_order.forEach(function(object_type) {
      tgame.entities[object_type] = tgame.entities[object_type].filter(function(o) {
        return !o.remove;
      });
    });
  }

  function render() {
    context.save();
    context.fillStyle = tgame.clear_color || "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.translate(-tgame.camera.x, -tgame.camera.y);

    render_order.forEach(function(object_type) {
      tgame.entities[object_type].forEach(function(o) {
        if (!o.hidden) {
          if (o.fixed) {
            context.save();
            context.translate(tgame.camera.x, tgame.camera.y);
            o.draw(context);
            context.restore();
          } else {
            o.draw(context);
          }
        }
      });
    });

    context.restore();
  }

})();