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

  var audio_extension = "";

  var DEFAULT_GAMEPAD = {
    left_stick: {
      x: 0,
      y: 0,
    },
    dpad: {
      x: 0,
      y: 0,
    },
    a: {
      changed: false,
      down: false
    },
    b: {
      changed: false,
      down: false
    },
    x: {
      changed: false,
      down: false
    },
    y: {
      changed: false,
      down: false
    },
    l: {
      changed: false,
      down: false
    },
    r: {
      changed: false,
      down: false
    },
    select: {
      changed: false,
      down: false
    },
    start: {
      changed: false,
      down: false
    },
  };

  var keydown_handlers = {};
  var keyup_handlers = {};
  var gamepad_index = -1;
  var last_gamepad = DEFAULT_GAMEPAD;
  var gamepad_handler;
  var render_order;
  var projection = {
    offset: { x: 0, y: 0 },
    scale: 1
  };
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
    STATES: {},
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
    setProjectionOffset: function (x, y) {
      projection.offset.x = x;
      projection.offset.y = y;
    },
    setProjectionScale: function(s) {
      projection.scale = s;
    },
    toggleFullscreen: function() {
      if (!document.fullscreenElement) {
        canvas.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
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
    gamepad: function (handler) {
      gamepad_handler = handler;
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

      if (gamepad_handler) {
        gamepad_index = navigator.getGamepads().findIndex(Boolean);
        last_gamepad = DEFAULT_GAMEPAD;

        window.addEventListener("gamepadconnected", function (e) {
          if (gamepad_index === -1) {
            gamepad_index = e.gamepad.index;
            last_gamepad = DEFAULT_GAMEPAD;
          }
        })

        window.addEventListener("gamepaddisconnected", function (e) {
          if (gamepad_index === e.gamepad.index) {
            gamepad_index = navigator.getGamepads().findIndex(Boolean);
            last_gamepad = DEFAULT_GAMEPAD;
          }
        })
      }

      if (asset_sources.length > 0) {
        loadAssets();
      } else {
        last_frame = Date.now();
        render();
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
          render();
        }
      });
    });
  }

  /*
    axes[0]: left stick x
    axes[1]: left stick y
    axes[6]: dpad x
    axes[7]: dpad y
    button[0]: A
    button[1]: B
    button[2]: X
    button[3]: Y
    button[4]: L
    button[5]: R
    button[6]: SELECT
    button[7]: START
  */
  function processGamepad(gp) {
    var a = gp.buttons[0].pressed;
    var b = gp.buttons[1].pressed;
    var x = gp.buttons[2].pressed;
    var y = gp.buttons[3].pressed;
    var l = gp.buttons[4].pressed;
    var r = gp.buttons[5].pressed;
    var select = gp.buttons[6].pressed;
    var start = gp.buttons[7].pressed;

    var gamepad =  {
      left_stick: {
        x: gp.axes[0],
        y: gp.axes[1],
      },
      dpad: {
        x: gp.axes[6],
        y: gp.axes[7],
      },
      a: {
        down: a,
        changed: a !== last_gamepad.a.down
      },
      b: {
        down: b,
        changed: b !== last_gamepad.b.down
      },
      x: {
        down: x,
        changed: x !== last_gamepad.x.down
      },
      y: {
        down: y,
        changed: y !== last_gamepad.y.down
      },
      l: {
        down: l,
        changed: l !== last_gamepad.l.down
      },
      r: {
        down: r,
        changed: r !== last_gamepad.r.down
      },
      select: {
        down: select,
        changed: select !== last_gamepad.select.down
      },
      start: {
        down: start,
        changed: start !== last_gamepad.start.down
      }
    };

    last_gamepad = gamepad;

    return gamepad;
  }

  function render() {
    window.requestAnimationFrame(render);

    current_frame = Date.now();

    var gp = navigator.getGamepads()[gamepad_index];
    if (gamepad_handler && gp) {
      var gamepad = processGamepad(gp);
      gamepad_handler(gamepad);
    }

    if (Object.hasOwn(tgame.STATES, tgame.state)) {
      tgame.STATES[tgame.state](current_frame - last_frame);
    }

    last_frame = current_frame;

    render_order.forEach(function(object_type) {
      tgame.entities[object_type] = tgame.entities[object_type].filter(function(o) {
        return !o.remove;
      });
    });

    context.save();
    context.fillStyle = tgame.clear_color || "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.translate(projection.offset.x, projection.offset.y);
    context.scale(projection.scale, projection.scale);

    context.translate(-tgame.camera.x, -tgame.camera.y);

    render_order.forEach(function(object_type) {
      tgame.entities[object_type].forEach(function(o) {
        if (!o.hidden) {
          context.save();
          if (o.fixed) {
            context.translate(tgame.camera.x, tgame.camera.y);
          }
          o.draw(context);
          context.restore();
        }
      });
    });

    context.restore();
  }

})();