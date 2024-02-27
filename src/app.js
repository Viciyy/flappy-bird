import Phaser from "phaser";

const spriteSize = 32;
var zoomLevel = window.innerHeight / 500;

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
  quackSound;
  bonkSound;

  preload ()
  {
    // https://caz-creates-games.itch.io/ducky-2
    this.load.spritesheet('duck', 'assets/ducky_2_spritesheet.png', { frameWidth: spriteSize, frameHeight: spriteSize, startFrame: 12, endFrame: 13 });
    // https://beeler.itch.io/top-down-earth-tileset
    this.load.image('background-tiles', 'assets/TileSet_V2.png');
    // https://www.myinstants.com/en/instant/quackmp3/
    this.load.audio('quack', 'assets/quack_5.mp3');
    // https://www.myinstants.com/en/instant/bamboo-hit-18672/
    this.load.audio('bonk', 'assets/bamboo-hit-sound-effect.mp3');
  }

  create ()
  {
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


    // Animate ducks from spritesheet frames
    this.anims.create({
      key: 'duckAnimation',
      frames: this.anims.generateFrameNumbers('duck'),
      frameRate: 10,
      repeat: 1
    });

    // Add ducks as a physics object and set base values
    this.duck = 
      this.physics.add
        .sprite(window.innerWidth / zoomLevel / 2, window.innerHeight / zoomLevel / 2, 'duck')
        .setGravityY(1000)
        .setMaxVelocity(0, 500) 
        .setCollideWorldBounds(true);

    // Initialize sound effects
    this.quackSound = this.sound.add('quack', { volume: 0.2 });
    this.bonkSound = this.sound.add('bonk', { volume: 0.2 });

    this.buttons.space.on('down', () => this.jump());
    this.input.on('pointerdown', () => this.jump());
  }

  update ()
  {
  }

  jump() { 
    this.duck.setAccelerationY(-7000).play('duckAnimation');
    setTimeout(() => this.duck.setAccelerationY(0), 100);
  }

  /**
   * Reset duck position and velocity
   * Play a sound effect
   * @param {Phaser.physics} duck duck
   */
  resetDuck(duck) {
    playSoundEffect(this.quackSound);
    duck.body.x = (gameWidth - spriteSize) / 2;
    duck.body.y = (gameHeight - spriteSize) / 2;
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
