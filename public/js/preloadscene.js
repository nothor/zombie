class LoadScene extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'LoadScene', active: true });
    }
  
    preload() {
  
      var loadingText = this.make.text({
          x: WIDTH / 2,
          y: HEIGHT / 2 - 50,
          text: 'Loading...',
          style: {
              font: '20px monospace',
              fill: '#ffffff'
          }
      });
      loadingText.setOrigin(0.5, 0.5);
  
      var progressBar = this.add.graphics();
      var progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(WIDTH/4-10, HEIGHT/2 - 10, WIDTH/2+20, 30+20);  //fillRect(x, y, width, height)
  
      this.load.on('progress', function (value) {
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(WIDTH/4, HEIGHT/2, value * WIDTH/2, 30);
      });
  
      this.load.on('complete', function () {
        progressBox.destroy();
        progressBar.destroy();
        loadingText.destroy();
      });

    //this.load.path = 'assets/sprites/'; //We don't need to add it every time!
    this.load.image('board', 'assets/sprites/field.png');
    this.load.image('smoke', 'assets/sprites/smoke-puff.png');
    this.load.atlas('flares', 'assets/sprites/colorsHD.png', 'assets/sprites/colorsHD.json');
    this.load.spritesheet('blood', 'assets/sprites/blood.png',    { frameWidth: 192, frameHeight: 192 } );
    
    //To load a Sprite
    this.load.spritesheet('player', 'assets/sprites/walkcycle.png',    { frameWidth: 64, frameHeight: 64 } );
    this.load.spritesheet('zombie', 'assets/sprites/zombieWalk.png',    { frameWidth: 52, frameHeight: 80 } );
    this.load.spritesheet('ghost', 'assets/sprites/ghost_small.png',    { frameWidth: 30, frameHeight: 35 } );
    this.load.atlas('supermarket', 'assets/sprites/supermarketSprite.png', 'assets/sprites/supermarketSprite.json');
    this.load.spritesheet('fruits', 'assets/sprites/fruitnveg32wh37.png', { frameWidth: 32, frameHeight: 32 });
  
    this.load.image('menu', ['assets/sprites/StartMenu.jpg', 'assets/sprites/StartMenu.jpg']);  //We use the same sprite as a shadows map
      
    }
  
    create ()
    {
      this.scene.start('MenuScene');      //Stops the current Scene and Starts the new
      //this.scene.launch('MenuScene');    //Starts the new in Parallel.    
    }
}