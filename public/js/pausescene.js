class PauseScene extends Phaser.Scene {

    //Scene Controll! https://labs.phaser.io/index.html?dir=scenes/&q=
    constructor ()
    {
        super({ key: 'PauseScene', active: false });  //active = true --> start scene
    }
  
    preload ()
    {
        
    }
  
    create ()
    {
      //Score
      var pauseText = this.add.text(HEIGHT+16, 16, 'Pause', { fontSize: '32px', fill: '#FFF' });
      /*
      this.input.once('pointerup', function () {
  
          console.log('From PauseMenu to InGame');
          //this.scene.bringToTop('inGame');
          //this.scene.resume('inGame');  //Resume Scene (from pause)
  
          //this.input.stopPropagation();
          this.scene.switch('inGame');  //Switch 
  
      }, this);
      */
     /*
      this.input.keyboard.on('keydown_ESC', function (event) {
        if(this.inPause){
          console.log('From PauseMenu to InGame');
          this.inPause = false;
          this.scene.switch('inGame');  //Switch 
        } 
      }, this);
      */
    }
  
}