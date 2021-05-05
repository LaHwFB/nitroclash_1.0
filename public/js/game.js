var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1200,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
// var mouse;
// let pitch;
var windowWidth = window.innerWidth;
var widnowHeight = window.innerHeight;

function preload() {
  this.load.image('background', 'assets/playfield-1.png');
  this.load.image('A', 'assets/A.png');
  this.load.image('B', 'assets/B.png');
  this.load.image('otherPlayer', 'assets/B.png');
}

function create() {
// console.log(windowWidth +' : '+ widnowHeight);  //
  //  game.input.addMoveCallback(move, this);
  // this.input.mouse.requestPointerLock();
  // this.mouse = input.mousePointer;
  // this.bg = this.physics.add.image(0, 0, 'background').setOrigin(0,0);
  // this.bg.setDisplaySize(windowWidth, widnowHeight);
  // createPitch(this);
  // this.pitch = this.physics.add.sprite(0, 0, 'background').setOrigin(0).setDisplaySize(1100,500);
  // this.pitch.setCollideWorldBounds(true);
  // this.pitch.body.setBounce(0, 0);
  // this.pitch.setImmovable(true);

  // this.add.image(0,0,'background').setOrigin(0,0).setDisplaySize(1200, 600);
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  // this.cursors = this.input.keyboard.createCursorKeys();
  this.input.on('pointermove', function (pointer){
      this.physics.moveToObject(self.ship, pointer, 300);
      // console.log(pointer.y);
      // let angle=Phaser.Math.Angle.BetweenPoints(this.ship.anchor,pointer.porisition);
      let angle=Phaser.Math.Angle.Between(self.ship.x,this.ship.y,pointer.x,pointer.y);
      self.ship.setRotation(angle);
      this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
      // Phaser.Math.Angle.RotateTo(currentAngle, targetAngle [, lerp])
      // console.log(Phaser.Math.RadToDeg(angle));
      // console.log(Phaser.Math.Angle.WrapDegrees(angle));
  }, this );

  // this.input.on('pointerout', function (pointer){
  //     // this.physics.moveToObject(self.ship, pointer, 120);
  //     // // console.log(pointer.y);
  //     // let angle=Phaser.Math.Angle.Between(this.ship.x,pointer.x,this.ship.y,pointer.y);
  //     // self.ship.setRotation(angle+Math.PI);
  //     console.log('pointer stoped ');
  // }, this );

  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
}

function update() {
  // this.input.on('POINTER_OUT', function (pointer){
  //     // this.physics.moveToObject(self.ship, pointer, 120);
  //     // // console.log(pointer.y);
  //     // let angle=Phaser.Math.Angle.Between(this.ship.x,pointer.x,this.ship.y,pointer.y);
  //     // self.ship.setRotation(angle+Math.PI);
  //     console.log('pointer stoped ');
  // }, this );
  // if (this.ship) {
  //     console.log(this.mousePointer);
  // this.physics.moveToObject(this.ship, game.input.mousePointer, 120);
      // this.physics.moveTo(this.ship.x, this.mousePointer, 120);
  //   if (this.cursors.left.isDown) {
  //     this.ship.setAngularVelocity(-150);
  //   } else if (this.cursors.right.isDown) {
  //     this.ship.setAngularVelocity(150);
  //   } else {
  //     this.ship.setAngularVelocity(0);
  //   }
  //
  //   if (this.cursors.up.isDown) {
  //     this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
  //   } else {
  //     this.ship.setAcceleration(0);
  //   }
  //
  //   var x = this.ship.x;
  //   var y = this.ship.y;
  //   var r = this.ship.rotation;
  //   if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
  //     this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
  //   }
  //
  // // save old position data
  //   this.ship.oldPosition = {
  //     x: this.ship.x,
  //     y: this.ship.y,
  //     rotation: this.ship.rotation
  //   }
  // }
}

// function requestLock() {
//     game.input.mouse.requestPointerLock();
// }
//
// function move(pointer, x, y, click) {
//
//     //  If the cursor is locked to the game, and the callback was not fired from a 'click' event
//     //  (such as a mouse click or touch down) - as then it might contain incorrect movement values
//     if (game.input.mouse.locked && !click)
//     {
//         this.ship.x += game.input.mouse.event.movementX;
//         this.ship.y += game.input.mouse.event.movementY;
//     }
//
// }

//my own functions
function addPlayer(self, playerInfo) {
  self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'B').setOrigin(0.5, 0.5).setDisplaySize(30, 30);
  // if (playerInfo.team === 'blue') {
  //   self.ship.setTint(0x0000ff);
  // } else {
  //   self.ship.setTint(0xff0000);
  // }
  self.ship.setDrag(100);
  self.ship.setAngularDrag(100);
  self.ship.setMaxVelocity(200);
  self.ship.setCollideWorldBounds(true);
  // self.ship.setBounce(0.8);
  // this.physics.add.collider(this.ship, this.pitch);

}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'B').setOrigin(0.5, 0.5).setDisplaySize(30, 30);
  // if (playerInfo.team === 'blue') {
  //   otherPlayer.setTint(0x0000ff);
  // } else {
  //   otherPlayer.setTint(0xff0000);
  // }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

// function createPitch(self){
//   self.pitch = self.physics.add.image(0, 0, 'background').setOrigin(0,0).setDisplaySize(1200, 800);
//   self.pitch.setCollideWorldBounds(true);
//   self.pitch.body.setBounce(0, 0);
//   self.pitch.setImmovable(true);
//
// }
