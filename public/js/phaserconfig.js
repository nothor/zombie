const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: WIDTH,
    height: HEIGHT,
    physics: {
      default: 'arcade',
      arcade: {
        debug: true,  //To See the Body
        gravity: { y: 0 }
      }
    },
    scene: [ LoadScene, MenuScene, GameScene, PauseScene ]
    /*
    scene: {
      preload: preload,
      create: create,
      update: update
    }
    */
};
  
var game = new Phaser.Game(config);