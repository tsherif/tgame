tgame
=====

A simple and very basic JavaScript game engine.

Implements a flexible state machine, asset loaders and helpers for basic collision detection, mouse and keyboard IO, and special effects.


Basics
------

To start a game with **tgame**, first set the game canvas:

```JavaScript
  tgame.setCanvas(document.getElementById("game-area"));
```

Set the frames per second:

```JavaScript
  tgame.setFPS(30);
```

Add assets: 

```JavaScript
  tgame.addSound("music", "audio/music");
  tgame.addImage("player", "img/player.png");
```

Declare your entities:

```JavaScript
  tgame.entities = {
    player: [],
    enemies: [],
    bullets: []
  };
```

Add controls:

```JavaScript
  tgame.addKeyControl(tgame.keyboard.LEFT, function() {
    moving_left = true;
  }, function() {
    moving_left = false;
  });

  tgame.addKeyControl(tgame.keyboard.RIGHT, function() {
    moving_right = true;
  }, function() {
    moving_right = false;
  });
```

Define game states:

```JavaScript
  tgame.STATES = {
    INIT: function() {
      //...
    },
    LEVEL1: function() {
      //...
    },
    GAME_OVER: function() {
      //...
    }
  };
```

Set the initial game state and start:

```JavaScript
  tgame.state = "INIT";
  tgame.start();
```

At this point assets will be loaded, and when they finish loading, **tgame** will begin looping on the initial game state. To change states, simply change the value of **tgame.state**;

Assets
------

**tgame** provides simple loaders for sounds and images. All assets will be loaded before game looping begins.

To load an image, simply call **tgame.addImage()** with a name for the asset and the asset's URL:

```JavaScript
  tgame.addImage("player", "img/player.png");
```

Once the game loads, the [Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement.Image) object associated with this asset will be available as **tgame.images.player**.

To load a sound, simple call **tgame.addSound()** with a name for the asset and the asset's URL **without** its file extension. **tgame** will assume that both [**.ogg**](http://www.vorbis.com/) and [**.mp3**](http://en.wikipedia.org/wiki/MP3) sound files exist at the given URL with the appropriate extention, and will load the one supported by the user's browser :

```JavaScript
  tgame.addSound("music", "sounds/music");
```

Once the game loads, the [Audio](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement) object associated with this asset will be available as **tgame.sounds.music**.


States
------

**tgame** states are defined in the object **tgame.STATES**. Each state is defined by its name and a function describing the state:

```JavaScript
  tgame.STATES = {
    INIT: function(delta) {
      //...
    },
    LEVEL1: function(delta) {
      //...
    },
    GAME_OVER: function(delta) {
      //...
    }
  };
```

The current state name is stored in the property **tgame.state**. Once a game starts, **tgame** will repeatedly call the state function associated with the current state, passing to it the time in milliseconds since the last iteration.


Entities
--------

The **tgame.entities** object contains the different types of entities in the game. The object keys represent the name of the entity type and the values are arrays containing all entities of that type in the game:

```JavaScript
  tgame.entities = {
    player: [],
    enemies: [],
    bullets: []
  };
```

An individual entity will can be any object the developer wishes. The only requirement is that the object define a method **draw** that takes a [canvas context](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D) object as its sole argument and draws the entity to it:

```JavaScript
  tgame.entities.player.push({
    //...
    draw: function(context) {
      // draw myself on the context
    }
  });
```

**tgame** will loop through all the entities calling their draw methods to draw them on the canvas. Two special properties reserved for entities are **hidden** and **remove**. If the **hidden** property is set to true, the entity will not be drawn to the canvas:

```JavaScript
  tgame.entities.bullets[0].hidden = true;
```

If the **remove** property is set to true, the entity will be completely removed from the entities array before the next game loop iteration:

```JavaScript
  tgame.entities.bullets[0].remove = true;
```

If desired, the rendering order can be explicitly set using the method **tgame.setRenderOrder**:

```JavaScript
  // Draw bullets first, then enemies, then player
  tgame.setRenderOrder(["bullet", "enemies", "player"]);
```


Controls
--------

**tgame** provides several convenience methods for control binding. 

Keyboard controls can be set using **tgame.addKeyControl**:

```JavaScript
  tgame.addKeyControl(tgame.keyboard.LEFT, function() {
    // Key down 
  }, function() {
    // Key up
  });
```

**tgame.addKeyControl** takes as arguments the key code for the key to bind and two callbacks, the first for a key down event on the key and the second for key up.

Convenient aliases for the key codes are available in the object **tgame.keyboard**.

Controls bound to a given key can be removed used **tgame.removeKeyControl**:

```JavaScript
  tgame.removeKeyControl(tgame.keyboard.LEFT);
```

Mouse controls can be added using the methods **tgame.mouseDown**, **tgame.mouseUp** and **tgame.mouseMove**. All three take as argument a callback to which the x and y coordinates of the mouse on the game canvas will be passed:

```JavaScript
  tgame.mouseMove(function(x, y) {
    // Move player to mouse
    tgame.entities.player[0].x = x;
    tgame.entities.player[0].y = y;
  });
```

Collisions
----------

**tgame** provides some helpers for simple collision detection in the namespace **tgame.collision**.

All collision methods operated on two objects and assume the objects contain **x**, **y**, **width** and **height** properties.

**tgame.collision.rectangle** checks the collision between two rectangular objects, and if there is a collision, returns an object containing the following information:

* **dx:** the horizontal displacement between the centers of the two rectangles
* **dy:** the vertical displacement between the centers of the two rectangles
* **side:** the side on which the collision occured ("top", "bottom", "left" or "right")
* **overlap_x:** the amount of horizontal overlap between the two rectangles
* **overlap_y:** the amount of vertical overlap between the two rectangles

```JavaScript
  var collision = tgame.collision.rectangle(player, enemy);
```

**tgame.collision.circle** checks the collision between two circular objects defined by bounding rectangles passed as arguments. I.e. the center of the circle is assumed to be at (**x + width / 2**, **y + height / 2**) and the radius is assumed to be **width / 2**. Currently, **tgame.collision.circle** simply returns **true** or **false** indicating whether there was a collision or not.

```JavaScript
  if (tgame.collision.circle(player, bullet)) {
    // ...
  }
}
```

The methods **tgame.collision.blockRectangle** and **tgame.collision.blockCircle** are similar to the above, but they will also move the object passed as first argument the minimum distance required to resolve the collision.

Effects
-------

**tgame** provides a helper for simple fade in and fade out effects:

```JavaScript
  tgame.effects.fade({
    objects: [title_message],
    multiplier: 0.95,
    interval: 30,
    delay: 1000,
    remove: true,
    complete: function() {
      // ...
    }
  });
```

The options are as follows: 

* **objects:** an array of objects to perform the fade on. It is assumed that these objects contain an **alpha** property between 0.0 and 1.0 that can be adjusted to adjust the opacity of the object.
* **multiplier:** multiplier to apply to the alpha value at each iteration. I.e. a multiplier greater than 1 indicates a fade in and a multiplier less than 1 indicates a fade out. Default is 0.9.
* **interval:** time in milliseconds between each iteration of the fade. Default is 30.
* **delay:** time in milliseconds before starting the fade. Default is 0.
* **remove:** should objects have their **remove** property set to **true** (i.e. be removed from the entities list, if they're entities) once the fade completes?
* **complete:** callback called once fade has completed on all objects.

