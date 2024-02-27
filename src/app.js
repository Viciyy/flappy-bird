import Phaser from "phaser";

const spriteSize = 32;
var zoomLevel = window.innerHeight / 500;

/**
 * Generate a random integer between min and max values
 * @param {integer} min minimum value
 * @param {integer} max maximum value
 * @returns random integer between min and max values
 */
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Generate an array for the background tiles of the level
 * @param {integer} levelWidth width of the level
 * @param {integer} levelHeight height of the level
 * @returns array for the background tiles
 */
const getLevelArray = (levelWidth, levelHeight) => Array.from({ length: levelHeight }, () => Array(levelWidth).fill(104));

class FlappyBird extends Phaser.Scene
{
  duck;
  pipes;
  quackSound;
  playerScoreText;
  playerPoints = 0;

  preload () {
    // https://caz-creates-games.itch.io/ducky-2
    this.load.spritesheet('duck', 'assets/ducky_2_spritesheet.png', { frameWidth: spriteSize, frameHeight: spriteSize, startFrame: 12, endFrame: 13 });
    // https://beeler.itch.io/top-down-earth-tileset
    this.load.image('background-tiles', 'assets/TileSet_V2.png');
    // https://www.myinstants.com/en/instant/quackmp3/
    this.load.audio('quack', 'assets/quack_5.mp3');
    // https://github.com/samuelcust/flappy-bird-assets/
    this.load.image('pipe', 'assets/pipe-green.png');
  }

  create () {
    // Add keyboard inputs
    this.buttons = this.input.keyboard.createCursorKeys();

    // Make a background from the tilemap
    const map = this.make.tilemap({ 
      data: getLevelArray(Math.ceil(window.innerWidth / spriteSize), Math.ceil(window.innerHeight / spriteSize)), 
      tileWidth: spriteSize, 
      tileHeight: spriteSize 
    });
    const tiles = map.addTilesetImage('background-tiles');
    map.createLayer(0, tiles, 0, 0);

    // Initialize score text
    this.playerScoreText = this.add.text(30, 30, this.playerPoints || '0', { fontSize: '32px', fill: '#000', fontStyle: 'bold' });

    // Animate duck from spritesheet frames
    this.anims.create({
      key: 'duckAnimation',
      frames: this.anims.generateFrameNumbers('duck'),
      frameRate: 10,
      repeat: 1
    });

    // Add duck as a physics object and set base values
    this.duck = 
      this.physics.add
        .sprite(window.innerWidth / zoomLevel / 2, window.innerHeight / zoomLevel / 2, 'duck')
        .setGravityY(1000)
        .setMaxVelocity(0, 500) 
        .setCollideWorldBounds(true);

    // Create pipes group and call createPipes first time
    this.pipes = this.physics.add.group();
    this.createPipes();
    
    // Initialize sound effect
    this.quackSound = this.sound.add('quack', { volume: 0.2 });

    // Player controls for jumping
    this.buttons.space.on('down', () => this.jump());
    this.input.on('pointerdown', () => this.jump());

    // Player controls for starting the game
    this.buttons.space.once('down', () => this.resetScoreAndWakeGame());
    this.input.once('pointerdown', () => this.resetScoreAndWakeGame());

    // Pause game on start
    setTimeout(() => this.game.loop.sleep(), 50);
  }

  update () { }

  /**
   * Create top pipe and bottom pipe
   * Puts the top and bottom pipe outside of canvas and adds a velocity to them
   * Y-coordinates are randomized between min and max offset values with a gap in between
   * Offsets are calculated based on pipe and canvas heights
   * Add collider to pipes and duck to reset game
   * Pipes are destroyed when they are out of game bounds
   * 
   * Create a score "pipe" which has a condition to increase score on collision with duck
   * Scorepipe collision also calls this method (createPipes) recursively to create new pipes
   */
  createPipes() {
    const pipeImage = this.textures.get('pipe').getSourceImage();
    const pipeLocationX = this.sys.game.canvas.width + pipeImage.width;
    const pipeHeight = pipeImage.height;
    const gap = 150;
    const maxOffset = pipeHeight / 2;
    const minOffset = -(pipeHeight / 2 - (this.sys.game.canvas.height - pipeHeight - gap));
    const offset = randomBetween(minOffset, maxOffset);
    
    const topPipe = 
      this.pipes
        .create(pipeLocationX, offset, 'pipe')
        .setVelocityX(-100)
        .setImmovable(true)
        .setFlipY(true);

    const bottomPipe = 
      this.pipes
        .create(pipeLocationX, offset + pipeHeight + gap , 'pipe')
        .setImmovable(true)
        .setVelocityX(-100);

    const scorePipe = this.physics.add.existing(this.add.rectangle(pipeLocationX + pipeImage.width/2, this.sys.game.canvas.height / 2, 5, this.sys.game.canvas.height));
    scorePipe.body.setVelocityX(-100);
    
    this.physics.add.collider(this.duck, this.pipes, () => this.resetGame());
    this.physics.add.collider(this.duck, scorePipe, () => this.increaseScoreAndResetScorePipe(scorePipe));
     
    topPipe.once('outOfBounds', () => {
      topPipe.destroy();
      bottomPipe.destroy();
    });
  }

  /**
   * Set duck acceleration and play duckAnimation
   * Reset duck acceleration after 100 milliseconds to prevent holding the jump button
   */
  jump() {
    this.duck.setAccelerationY(-5000).play('duckAnimation');
    setTimeout(() => this.duck.setAccelerationY(0), 100);
  }

  /**
   * Reset game
   * Play a sound effect
   */
  resetGame() {
    this.quackSound.play();
    this.scene.restart();
  }

  /**
   * Increase score, destroy scorePipe and create new pipes
   * @param {Phaser.Physics} scorePipe 
   */
  increaseScoreAndResetScorePipe(scorePipe) {
    this.createPipes();
    scorePipe.destroy();
    this.playerPoints++;
    this.playerScoreText.setText(this.playerPoints);
  }

  /**
   * Wakes the game after a small timeout and resets player score back to 0
   */
  resetScoreAndWakeGame() {
    setTimeout(() => this.game.loop.wake(), 50);
    this.playerPoints = 0;
    this.playerScoreText.setText(this.playerPoints);
  }
}

const config = {
  type: Phaser.AUTO,
  scene: FlappyBird,
  scale: {
    mode: Phaser.Scale.NONE,
    width: window.innerWidth / zoomLevel,
    height: window.innerHeight / zoomLevel,
    zoom: zoomLevel
},
  physics: {
    default: 'arcade',
    arcade: {
        debug: false
    }
  }
};

const game = new Phaser.Game(config);
