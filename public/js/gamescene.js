  //Example http://labs.phaser.io/view.html?src=src\physics\arcade\space.js&v=3.9.0

  //Arcade Physics
  //https://phaser.io/docs/2.6.2/Phaser.Physics.Arcade.html

class GameScene extends Phaser.Scene {

  constructor ()
  {
      super({ key: 'GameScene', active: false }); //active = true --> start scene
      //podemos añadir las variables aqui también o resetearlas
  }

  preload ()
  {

  }

  create ()
  {
    var self = this;  //Para poder usar this como variable dentro de una función.
    this.socket = io();

    //Add background
    this.board = this.add.image(WIDTH/2,HEIGHT/2, 'board').setScale(2);

    //setBoard();

    //Game Objects are positioned based on their center by default --> add .setOrigin(0, 0) to set a diferent "Anchor"
    //this.player = this.physics.add.image(32+WIDTH/2,32+HEIGHT/2, 'car');
    this.player = this.physics.add.sprite(32+WIDTH/2,32+HEIGHT/2, 'player');
    
    this.ghosts = this.physics.add.group({
      key: 'ghost',
      //frame: 3,
      repeat: numGhosts-1,
      setXY: { x: 0, y: 0, stepX: 160, stepY: 120 },
    });

    //two types of physics bodies: Dynamic and Static --> Static --> .staticGroup()
    this.fruits = this.physics.add.group(); 
    for (var i = 0; i < numFruits; i++) {
      this.fruits.create(randomInt(0, WIDTH), randomInt(0, HEIGHT), 'fruits', randomInt(0, 36)); //37 different Fruits
      //Option 2: add an image and then add it to the group
      /*
      var ghost = this.physics.add.image(randomInt(0, WIDTH), randomInt(0, HEIGHT), 'ghost');
      this.ghosts.add(ghost);
      */
    }

    this.racks = this.physics.add.group();
    for (var i = 0; i < numRacks; i++) {
      this.racks.create(randomInt(0, WIDTH), randomInt(0, HEIGHT), 'supermarket', rackKeys[randomInt(0, 4)]); //37 different Fruits
    }

    this.carts = this.physics.add.group();
    for (var i = 0; i < numCarts; i++) {
      this.carts.create(randomInt(0, WIDTH), randomInt(0, HEIGHT), 'supermarket', 'cart'); //37 different Fruits
    }

    //Zombie as a Sprite
    this.zombies = this.physics.add.group(); 
    for (var i = 0; i < numZombies; i++) {       
      //Option 2: add an image and then add it to the group
      var zombie = this.physics.add.sprite(randomInt(0, WIDTH), randomInt(0, HEIGHT), 'zombie'); //.setScale(2)
      //Size of the Sprite --> .setScale(0.5)
      this.zombies.add(zombie);
    }

    //Score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });

    //Particles    //Particles
    setParticles(this); //Podemos llamarlo con .call así nos ahorramos usar self. en la función

    setObjectProperties(this);
    setPhysics(this);       //Podemos llamarlo con .call así nos ahorramos usar self. en la función
    setAnimations(this);    //Outside from IniMenu

    //SET Camera
    this.cameras.main.setBounds(0, 0, this.board.widthInPixels, this.board.heightInPixels);
    this.cameras.main.startFollow(this.player);
    
    //Control de Teclado

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyFire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyAction = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    console.log(this); //this.children.getAll()

    //Add Emitters
    //  Create our own EventEmitter instance
    //this.events = new Phaser.EventEmitter();    //Doesn't work on Phaser 3.9.0

    //  Set-up an event handler
    this.events.on('movePlayer', emitMove, this);
    this.events.on('firePlayer', emitFire, this);
    this.events.on('bloodExplodes', emitBlood, this);
    
    //Scene Control
    /*
    this.inPause = false;
    this.input.keyboard.on('keydown_ESC', function (event) {
      if(!this.inPause){
        console.log('From InGame to PauseMenu');
        this.inPause = true;
        self.scene.switch('pauseMenu');  //Switch 
      }
    }, this);
    */

    /*
    this.input.once('pointerup', function (event) {
        console.log('From InGame to StartMenu');
        //this.scene.start('startMenu');
        
        //this.scene.pause();
        //this.scene.launch('pauseMenu'); //launch executes Scene in parallel!
        //this.scene.bringToTop('pauseMenu');
        
        //this.input.stopPropagation();
        this.scene.switch('pauseMenu');  //Switch 
    }, this);
    */
  }

  update (time, delta)
  {
    //var self = this;  //Para poder usar this como variable dentro de una función o se puede usar el this como parametro

   this.board.rotation += 0.00002 * delta; 

    //Move TinCars
    //.children.iterate() == .getChildren().forEach()
    this.ghosts.getChildren().forEach(function(ghost){
      if(ghost.active){
        accelerateToObject(this, ghost, 500);  //start accelerateToObject on every ghost
        animateObject(ghost, 'ghostMove');
      }
    }, this);  //Nos ahorramos poner el self dentro de la función

    //Move zombie
    this.zombies.getChildren().forEach(function(zombie){
      if(zombie.active){
        accelerateToObject(this, zombie, 300);
        animateObject(zombie, 'zombieWalk');
      }
    },this);

    //Move Racks
    this.racks.getChildren().forEach(function(rack){
      if(rack.pulled){
        if(this.player.pull){
          this.physics.moveToObject(rack, this.player, maxPullSpeedPlayer);
        } else
        rack.pulled = false;
      }
    },this);

    //Move Carts
    this.carts.getChildren().forEach(function(cart){
      if(cart.pulled){
        if(this.player.pull){
          this.physics.moveToObject(cart, this.player, maxPullSpeedPlayer);
        } else
        cart.pulled = false;
      }
    },this);

    //Key Inputs Handling
    checkKeyInputs(this);
    if(!this.player.pull){
      animatePlayer(this.player);
    }

    //Set Depth (z-index) --> .setDepth(value); --> value by default == 0
    this.children.getAll().forEach(function(child){
      //Si tienen body los ordenamos.
      if(child.body !== null){ child.setDepth(child.body.position.y); }
    });
  }

}

  function emitMove(angleRad){
    var angleDeg = Math.degrees(angleRad);
    var angleAperture = 10;
   
    this.fire.setAngle( { min: angleDeg-angleAperture, max: angleDeg+angleAperture});
    /*
    this.fire.setFrame([ 'red', 'blue', 'green', 'yellow' ]); //multiple frames
    this.fire.setFrame('red');  //one frame
    this.fire.setPosition(400, 300);
    this.fire.setSpeed(200);
    this.fire.setLifespan(3000);
    this.fire.setBlendMode('ADD');
    this.fire.setBlendMode(Phaser.BlendModes.ADD);
    this.fire.startFollow(object);
    */
  }

  function emitFire(fireOn){
    if(fireOn){
      this.fire.explode();
    }
  }

  function emitBlood(object){
    this.blood.setPosition(object.body.position.x, object.body.position.y);
    this.blood.explode();
  }

  function accelerateToObject(self, follower, acceleration) {
   //Optional Arguments
   if (typeof acceleration === 'undefined') { acceleration = 100; }
   if (typeof accelerateObject === 'undefined') { accelerateObject = true; }
   if (typeof rotateObject === 'undefined') { rotateObject = true; }

   var angle = Math.atan2(self.player.y - follower.y, self.player.x - follower.x);  //OJO peligro con el atan2 no lo calcula bien

   follower.body.setAcceleration(Math.cos(angle) * acceleration, Math.sin(angle) * acceleration); //not use .setVelocity if we want to push it
   /*
   if(rotateObject){
    follower.rotation = angle + Math.radians(90);  // correct angle of angry ghosts (depends on the sprite used)
   }
   //Accelerate the object
   if(accelerateObject){
   self.physics.velocityFromRotation(follower.rotation + 1.5, acceleration*(-1), follower.body.acceleration);
   } else{
   //Set a specific Speed
   
   }
   */
}

function animateObject(object, key){
  if(object.body.velocity.x > 0){
  object.flipX = false;
  object.anims.play(key, true);
  } else{
  //object.anims.play('zombieWalkReverse', true);
  
  //We can use flipX
  object.flipX = true;
  object.anims.play(key, true);
  }    
}

function animatePlayer(object){

  var Vx = object.body.velocity.x;
  var Vy = object.body.velocity.y;

  if(Vx == 0 && Vy == 0){
    //Set the first Frame of the current sequence
    object.anims.restart();
    object.anims.pause();   //Changed in 3.9.0 from paused to pause
    return; //we don't continue
  }

  //if any cursor is down, if not do not update the Animation.
  if(object.isMoving){  
    if(Math.abs(Vx) >= Math.abs(Vy)){
      //Left or Right
      if(Vx < 0){
        object.flipX = false;
        object.anims.play('leftPlayer', true);
      } else{
        //object.anims.play('rightPlayer', true);
        
        //we can use FlipX
        object.flipX = true;
        object.anims.play('leftPlayer', true);
      }  

    } else{
      //Up or Down
      if(Vy < 0){
        object.anims.play('upPlayer', true);
      } else{
        object.anims.play('downPlayer', true);
      }  
    }
  }
}

function checkKeyInputs(self){
  const accelerationPlayer = 1000;

  self.player.isMoving = false;
  self.player.body.setAcceleration(0);

  if (self.cursors.left.isDown) {
    //self.player.body.setAngularVelocity(-300);
    self.player.body.setAccelerationX(accelerationPlayer*(-1));
    self.player.isMoving = true;
  } else if (self.cursors.right.isDown){
    //self.player.body.setAngularVelocity(300);
    self.player.body.setAccelerationX(accelerationPlayer);
    self.player.isMoving = true;
  } 
  
  if (self.cursors.up.isDown){
    self.player.body.setAccelerationY(accelerationPlayer*(-1));
    self.player.isMoving = true;
  } else if (self.cursors.down.isDown){
    self.player.body.setAccelerationY(accelerationPlayer);
    self.player.isMoving = true;
  } 

  //LO estamos calculando en cada momento sin necesidad de estar disparando!! <--SOLO ajustar el angulo si disparo!
  if(self.player.isMoving){
    //Emitt signal 'movePlayer' with 1 Argument
    self.events.emit('movePlayer', self.player.body.angle);
  }

  //Check Fire
  if (self.keyFire.isDown)
  {
    //Send Emitter
    self.events.emit('firePlayer', true);
  } 

  //Check Action
  if(self.keyAction.isDown){
    self.player.action = true
  } else if (self.player.action && self.keyAction.isUp){    //Hace falta self.player.action??
    self.player.action = false;
    self.player.pull = false;
    self.player.setMaxVelocity(maxSpeedPlayer)
    self.player.setDrag(dragPlayer);
  }
}

function hitPlayer (player, ghost)
{
  //this.physics.pause();
  player.setTint(0xff0000);

  setTimeout(function() { player.clearTint();}, 200); //Clear Tint after 200ms

  player.hp -=1;
  if(player.hp <0){
    player.hp = 0;  //not needed
    //gameOver = true;
    //this.scene.restart();
  }
}

function hitEnemy (enemy, damage)
{
  //Do Something for example zombie attack!
  enemy.setTint(0xff0000);
  setTimeout(function() { enemy.clearTint();}, 200); //Clear Tint after 200ms

  enemy.hp -=damage;
  if(enemy.hp <0){
    this.events.emit('bloodExplodes', enemy);
    enemy.destroy();  //set the child as undefined
    //Option 1, disable body but still exists...
    //enemy.disableBody(true, true) //Keeps the child properties
    
    //enemy.setActive(false);
    //enemy.setVisible(false);
  }
}

function hitWithCart(cart, object){
  var damage = cart.body.speed - (maxSpeedPlayer)*0.85;
  if(damage > 0){
    console.log(cart.body.speed + ', ' + damage);
    hitEnemy.call(this, object, damage);  //Añadiendo .call puedo pasar el this de este contexto a la siguiente función, sin modificar la función siguiente
  }
}

function collectObject (player, object)
{
    //object.disableBody(true, true);
    object.destroy();

    score += 10;
    scoreText.setText('Score: ' + score);
    
    player.hp +=5;
    if(player.hp > player.hpMax){
      player.hp = player.hpMax;
    }

    if(this.fruits.getLength()==0){
      this.scene.restart();
    }
}

function pullObject(player, object){
  if(player.action){
    //Solo cogemos el objeto que está encarado con nosotros.
    var key = getDirection(player);
    if (player.body.touching[key])
        object.pulled = true; //Then move with the player...
        player.pull = true;

        //copy the physics of the worst objects!
        player.setMaxVelocity(maxPullSpeedPlayer*0.8);
        player.setDrag(object.body.drag);
  }
}

function getDirection (object) {
  var angle = object.body.angle;  //rotation?

  if(angle <= 0){
      angle += 2*Math.PI;
  }

  //OJO solo tenemos en cuenta los angulos positivos.
  if ((angle >= Math.PI / 4) && (angle < 3 * Math.PI / 4)) {
      //Pi/2
      return 'down';
  } else if ((angle >= 3 * Math.PI / 4) && (angle < 5 * Math.PI / 4)) {
      //Pi
      return 'left';
  } else if ((angle >= 5 * Math.PI / 4) && (angle < 7 * Math.PI / 4)) {
      //3*Pi/2
      return 'up';
  } 
  /*
  else if ((angle >= 7 * Math.PI / 4) && (angle < 9 * Math.PI / 4)) {
      //0
      moveDirection = 'right';
  }
  */
  else{
    return 'right';
  }
}

function setObjectProperties(self){
    //Player Properties
    self.player.isMoving = false; //To check if the player move him self
    self.player.hp = 50;          //New Key to track Life
    self.player.hpMax = 50;

    //
    self.ghosts.children.iterate(function (child) {
      child.hp = 20;   //NO podemos usar this dentro de una función, ya que haría referencia a la propia función!!
    });

    self.zombies.children.iterate(function (child) {
      child.hp = 40;
    });
}

function setPhysics(self){
    //Set Physics and colliders
    setObjectPhysics(self.player, dragPlayer, 0.2, true, maxSpeedPlayer);
    setObjectBody(self.player, 1/4, 1/5, 2);

    //Collider between player and others with Callbacks
    self.physics.add.collider(self.player, self.ghosts, hitPlayer, null, self);  //Los argumentos del final nos permiten llamar a this dentro de la función CallBack
    self.physics.add.collider(self.player, self.zombies, hitPlayer, null, self);  //Ponemos self en vez de this, sino pasaríamos la funcion!!
    //Set Overlap control (without collition physics)
    self.physics.add.overlap(self.player, self.fruits, collectObject, null, self);

    //.children.iterate() == .getChildren().forEach()
    self.ghosts.children.iterate(function (child) {
      setObjectPhysics(child, 200, 0.4, true, maxSpeedGhost);  //NO podemos usar this dentro de una función, ya que haría referencia a la propia función!!
      setObjectBody(child, 2/3, 1/3, 5);
    });
    self.physics.add.collider(self.ghosts, self.ghosts);  //In 3.9.0 we can set groups against groups.
    self.physics.add.collider(self.ghosts, self.zombies);
    self.physics.add.collider(self.ghosts, self.fruits);

    self.fruits.children.iterate(function (child) {
      setObjectPhysics(child, undefined, 0.8, true);  //NO podemos usar this dentro de una función, ya que haría referencia a la propia función!!
      setObjectBody(child);
    });
    self.physics.add.collider(self.fruits, self.fruits);

    self.zombies.children.iterate(function (child) {
      setObjectPhysics(child, 200, 0.2, true, maxSpeedZombie);  //NO podemos usar this dentro de una función, ya que haría referencia a la propia función!!
      setObjectBody(child, 1/2, 1/5);
    });
    self.physics.add.collider(self.zombies, self.zombies);  //In 3.9.0 we can set groups against groups.
    self.physics.add.collider(self.zombies, self.fruits);

    self.carts.children.iterate(function (child) {
      setObjectPhysics(child, 10, 0.4, true);  //NO podemos usar this dentro de una función, ya que haría referencia a la propia función!!
      setObjectBody(child, 1, 1/3);
    });
    self.physics.add.collider(self.carts, self.carts);
    self.physics.add.collider(self.carts, self.racks);
    self.physics.add.collider(self.carts, self.zombies, hitWithCart, null, self);
    self.physics.add.collider(self.carts, self.fruits);
    self.physics.add.collider(self.player, self.carts, pullObject, null, self);

    self.racks.children.iterate(function (child) {
      setObjectPhysics(child, 1000, 0.2, true);  //NO podemos usar this dentro de una función, ya que haría referencia a la propia función!!
      setObjectBody(child, 1, 1/4);
    });
    self.physics.add.collider(self.racks, self.racks);
    self.physics.add.collider(self.racks, self.zombies);
    self.physics.add.collider(self.racks, self.fruits);
    self.physics.add.collider(self.player, self.racks, pullObject, null, self); //We can add Here Pull Option pullObject

    //Particles can not be       
    //SET Particles overlap
    //self.physics.add.overlap(child,self.flares, hitEnemy, null, this);
   
}

function setObjectPhysics(object, drag, bounce, worldBounds, maxSpeed){
  if (typeof drag !== 'undefined') {        object.setDrag(drag);   }               //Decrease the Speed to 0
  if (typeof bounce !== 'undefined') {      object.setBounce(bounce); }             //EL factor de "rebote" en choque
  if (typeof worldBounds !== 'undefined') { object.setCollideWorldBounds(worldBounds); }
  if (typeof maxSpeed !== 'undefined') { object.setMaxVelocity(maxSpeed); }

  //More
  //object.setAngularDrag(100);  //Decrease Angular Speed to 0
}

function setObjectBody(object, widthRatio, heightRate, panY){
  if (typeof widthRatio === 'undefined'){ widthRatio = 2/3;}
  if (typeof heightRate === 'undefined'){ heightRate = 1/3;}
  if (typeof panY === 'undefined'){ panY = 0;}
  
  var bodyW = Math.floor(object.width*widthRatio);
  var bodyH = Math.floor(object.height*heightRate);
  var bodyOffX = Math.floor((object.width-bodyW)/2);
  var bodyOffY = object.height-bodyH-panY;
  
  object.setSize(bodyW, bodyH);  //Size of the Body
  object.setOffset(bodyOffX,bodyOffY); //(frame-size)/2, frame-size - Pan

}

function setAnimations(self){
  //Animation --> Phaser supports flipping sprites to save on animation frames
  self.anims.create({
    key: 'zombieWalk',
    frames: self.anims.generateFrameNumbers('zombie', { start: 0, end: 12 }),
    frameRate: 10,
    repeat: -1  //tells the animation to loop
  });
  self.anims.create({
    key: 'zombieWalkReverse',
    frames: self.anims.generateFrameNumbers('zombie', { start: 13, end: 24 }),
    frameRate: 10,
    repeat: -1  //tells the animation to loop
  });

  self.anims.create({
    key: 'ghostMove',
    frames: self.anims.generateFrameNumbers('ghost', { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1  //tells the animation to loop
  });

  self.anims.create({
    key: 'upPlayer',
    frames: self.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1  //tells the animation to loop
  });

  self.anims.create({
    key: 'leftPlayer',
    frames: self.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
    frameRate: 10,
    repeat: -1  //tells the animation to loop
  });
  
  self.anims.create({
    key: 'downPlayer',
    frames: self.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
    frameRate: 10,
    repeat: -1  //tells the animation to loop
  });

  self.anims.create({
    key: 'rightPlayer',
    frames: self.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
    frameRate: 10,
    repeat: -1  //tells the animation to loop
  });

  //Ini Player animation
  self.player.anims.play('downPlayer', true);

}

function setParticles(self){

  //Set Collitions (not Possible with Physics... :()
  var enemyCollition = {
    contains: function (x, y) 
    {
        var hit = null;
        self.zombies.children.iterate(function(child){
          if(typeof child !== 'undefined'){ //child.active
            hit = child.body.hitTest(x, y);
            if (hit) { hitEnemy.call(self, child, 1); return}
          }
        })

        self.ghosts.children.iterate(function(child){
          if(typeof child !== 'undefined'){
            hit = child.body.hitTest(x, y);
            if (hit) { hitEnemy.call(self, child, 1); return}
          }
        })

        return hit;
    }
  };
  //particles, flare
  self.flares = self.add.particles('flares');
  
  self.fire = self.flares.createEmitter({
    //frame: 'blue',  //If the instead of a image we add a SPritesheet we can select the frame from a name (.json) o number
    frame: [ 'red', 'blue', 'green', 'yellow', 'white' ], //or even add different frames at the same time!
    x: 10,
    //y: 0,
    //angle: { min: 0, max: 360, steps: 64 },  //Apertura del chorro de particulas (0-360 omnidireccional!) y giro con steps
    angle: { min: 80, max: 100},
    speed: { min: 250, max: 300 },  //Velocidad de cada partícula
    scale: { start: 0.2, end: 0 },  //Tamaño de las particulas al principio y final
    blendMode: 'ADD',
    //quantity: 2,  //numero de chorros simultaneos
    //lifespan: 500, //duración en tiempo
    deathZone: { type: 'onEnter', source: enemyCollition },   //Fijar zona de Colisión! Y un callback
    on: false     //Initial on = false -> NOt emitting!
  });

  //we can create several Emitter with the same "self.flares.createEmitter"

  //We Follow the Player body! -> No need to update position.
  self.fire.startFollow(self.player.body);

  //Create directly a emitter
  self.blood = self.add.particles('blood').createEmitter({
    frame: [ 10, 11, 12, 13, 14, 20, 21, 22 ], //or even add different frames at the same time!
    //x: 0,
    //y: 0,
    angle: { min: 0, max: 360, steps: 3 }, //Con steps hacemos que gire
    speed: { min: 50, max: 100 },  //Velocidad de cada partícula
    scale: { start: 0, end: 0.5 },  //Tamaño de las particulas al principio y final
    blendMode: 'ADD',
    quantity: 3,  //numero de chorros simultaneos
    lifespan: 500, //duración en tiempo
    on: false     //Initial on = false -> NOt emitting!
  });

}

function setBoard(){
    //https://labs.phaser.io/index.html?dir=game%20objects/tilemap/&q=

    // Load a blank map with a 32 x 32 px tile size. This is the base tile size. This means that
    // tiles in the map will be placed on a 32 x 32 px grid.
    var map = this.make.tilemap({ width: 200, height: 200, tileWidth: 32, tileHeight: 32 });

    // You can also change the base tile size of map like this:
    // map.setBaseTileSize(32, 32);

    // Load a 32 x 64 px tileset. This tileset was designed to allow tiles to overlap vertically, so
    // placing them on a 32 x 32 grid is exactly what we want.
    var tiles = map.addTilesetImage('walls_1x2', null, 32, 64);

    // Create a layer filled with random trees (the numbers arethe positions of the spreet
    var layer = map.createBlankDynamicLayer('layer1', tiles);
    layer.randomize(0, 0, map.width, map.height, [ 0, 1, 2, 3, 4, 5, 6, 7 ]);  

    //1 tile
    map.putTileAt(15, pointerTileX, pointerTileY);
    //1D
    map.putTilesAt([ 104, 105, 106, 107 ], pointerTileX, pointerTileY);
    //2D
    map.putTilesAt([
      [ 49, 50 ],
      [ 51, 52 ]
    ], pointerTileX, pointerTileY);

    /*
    //OPTION 1
    // Creating a blank tilemap with the specified dimensions
    var map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 18, height: 13});

    var tiles = map.addTilesetImage('tiles');

    var layer = map.createBlankDynamicLayer('layer1', tiles);
    layer.setScale(3);

    // Add a simple scene with some random element. Since there is only one layer, we can use map or
    // layer interchangeably to access tile manipulation methods.
    map.fill(58, 0, 10, map.width, 1); // Surface of the water
    layer.fill(77, 0, 11, map.width, 2); // Body of the water
    map.randomize(0, 0, 8, 10, [ 44, 45, 46, 47, 48 ]); // Left chunk of random wall tiles
    layer.randomize(8, 0, 9, 10, [ 20, 21, 22, 23, 24 ]); // Right chunk of random wall tiles

    //OPTION 2
    //Create a Map using a CSV, the number in the CSV corresponds to the position of the Sprite.
    // When loading a CSV map, make sure to specify the tileWidth and tileHeight
    map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
    var tileset = map.addTilesetImage('tiles');
    var layer = map.createStaticLayer(0, tileset, 0, 0);

    //  This isn't totally accurate, but it'll do for now
    map.setCollisionBetween(54, 83);

    this.physics.add.collider(player, layer);
    */
}

Math.radians = function(degrees) {
  //Phaser.Math.DegToRad(degrees);
  return degrees * Math.PI / 180;
};

Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function randomInt(min, max){
  //min = min || 0;   // b will be set either to b or to 0.
  return Math.floor(Math.random() * (max-min + 1) + min);
}
