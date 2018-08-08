class MenuScene extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'MenuScene', active: false });
    }
  
    preload ()
    {

    }
  
    create ()
    {
        this.menu = this.add.image(WIDTH/2, HEIGHT/2, 'menu');
        
        //In order to use Light the image must to include the shadows map
        //['assets/normal-maps/brick.jpg', 'assets/normal-maps/brick_n.png']);
        this.menu.setPipeline('Light2D');
        this.light = this.lights.addLight(0, 0, 200); //we can add --> .setColor(0xffffff).setIntensity(2)
        this.lights.enable().setAmbientColor(0x550000); //color of the shadows...
  
        this.input.on('pointermove', function (pointer) {
          this.light.x = pointer.x;
          this.light.y = pointer.y;
        }, this);
  
        this.input.once('pointerup', function () {
    
          this.scene.start('GameScene'); //Start the scene and stop this one.
        }, this);
    }
}