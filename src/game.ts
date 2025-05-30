import * as THREE from "three";
import { Ship } from "./things/ship.js";
import { Amoeba } from "./things/amoeba.js";
import { AmoebaBig } from "./things/amoeba_big.js";
import { AmoebaMedium } from "./things/amoeba_medium.js";
import { AmoebaSmall } from "./things/amoeba_small.js";
import { KeyboardController } from "./keyboard-controller.js";
import { CollissionDetection } from "./collision_detection.js";
import { Clock } from "./clock.js";
import { Bullet } from "./things/bullet.js";

export interface GameOptions {
  canvas: HTMLCanvasElement;
}

export class Amoeboids {
  private _scene: THREE.Scene;
  private _camera: THREE.OrthographicCamera;
  private _renderer: THREE.WebGLRenderer;
  private _ship: Ship;
  private _amoebas: Amoeba[] = [];
  private _keyboardController: KeyboardController;
  private _clock: Clock;
  private _bulletLastTime = 0;
  private _bullets: Bullet[] = [];

  private _bulletMaxAge = 3_000; // ms

  private _shipCollisionDetector: CollissionDetection;
  private _bulletCollisionDetectors = new Map<Bullet, CollissionDetection>();

  // left right top bottom
  private _boundary: [number, number, number, number];

  constructor(options: GameOptions) {
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x000000);
    this._clock = new Clock(() => this.tick());

    const width = window.innerWidth;
    const height = window.innerHeight;

    this._boundary = [width / -2, width / 2, height / 2, height / -2];

    const camera = new THREE.OrthographicCamera(
      this._boundary[0],
      this._boundary[1],
      this._boundary[2],
      this._boundary[3],
      0.1,
      1000
    );

    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);

    this._camera = camera;

    this._renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: true,
    });
    this._renderer.setSize(width, height);

    this._ship = new Ship();
    this._ship.setBoundary(this._boundary);
    this._ship.add(this._scene);

    const a1 = new AmoebaBig({ initialPosition: { x: 200, y: 300 }, velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() } });
    const a2 = new AmoebaBig({ initialPosition: { x: -100, y: -60 }, velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() } });
    a1.setBoundary(this._boundary);
    a2.setBoundary(this._boundary);
    a1.add(this._scene);
    a2.add(this._scene);

    this._amoebas.push(a1, a2);

    this._keyboardController = new KeyboardController(window.document.body, {
      onFire: () => {
        this.fire();
      },
      onTurnR: () => {
        this._ship.turn(0.1);
      },
      onTurnL: () => {
        this._ship.turn(-0.1);
      },
      onAccel: () => {
        this._ship.accel(0.5);
      },
      onDeccel: () => {
        this._ship.accel(-0.2);
      }
    });

    this._keyboardController.attach();
    for (let i = 0; i <= 60; i++) {
      this._addStar();
    }


    this._shipCollisionDetector = new CollissionDetection(this._ship, this._amoebas);
  }

  start() {
    this._clock.start();
  }

  tick() {
    this._keyboardController.process();
    this.update();
    this._renderer.render(this._scene, this._camera);
  }

  /**
   *  THE GAME LOOP
   **/
  update(): void {
    this._ship.update();

    this._bullets.forEach(b => b.update());

    const oldBulletIndexes: number[] = [];

    for (let i = 0; i < this._bullets.length; i++) {
      const b = this._bullets[i];
      if (b.age > this._bulletMaxAge) {
        oldBulletIndexes.push(i);
      }
    }

    for (let i = 0; i < oldBulletIndexes.length; i++) {
      this._bullets[i].remove();
      this._bullets.splice(i, 1);
    }

    this._amoebas.forEach(a => a.update());
    const shipCollisions = this._shipCollisionDetector.process();

    if (shipCollisions.length > 0) {
      //game over!
      console.log("You died");
      this._clock.pause();
    }

    const hitAmoebas = new Set<Amoeba>();
    const hitBullets = new Set<Bullet>();
    for (const [b, cd] of this._bulletCollisionDetectors.entries()) {
      // an array of amoeba indexes
      const collisions = cd.process();
      for (let i = 0; i < collisions.length; i++) {
        hitAmoebas.add(this._amoebas[collisions[i]]);
        hitBullets.add(b);
      }
    }

    for (const a of hitAmoebas.values()) {
      this._amoebaHit(a);
    }

    for (const b of hitBullets.values()) {
      const bulletIndex = this._bullets.indexOf(b);
      if (bulletIndex > -1) {
        this._bullets.splice(bulletIndex, 1);
      }
      this._bulletCollisionDetectors.delete(b);
      b.remove();
    }

  }

  fire() {
    if (this._bulletLastTime + 200 > Date.now()) {
      return;
    }
    this._bulletLastTime = Date.now();
    const shipVelocity = this._ship.velocity;
    const shipHeading = this._ship.getHeading();
    const bulletSpeed = 3;

    let bSpeedX = Math.sin(shipHeading) * bulletSpeed;
    let bSpeedY = Math.cos(shipHeading) * bulletSpeed;

    bSpeedX += shipVelocity.x;
    bSpeedY += shipVelocity.y;

    const bSpeed = Math.sqrt(bSpeedX * bSpeedX + bSpeedY * bSpeedY);

    const bAngle = Math.atan2(bSpeedX, bSpeedY);

    const b = new Bullet({ initialPosition: this._ship.position, speed: bSpeed, heading: bAngle });
    b.add(this._scene);
    this._bullets.push(b);

    const cd = new CollissionDetection(b, this._amoebas);
    this._bulletCollisionDetectors.set(b, cd);
  }

  private _amoebaHit(amoeba: Amoeba) {
    const amoebaIndex = this._amoebas.indexOf(amoeba);
    if (amoebaIndex > -1) {
      this._amoebas.splice(amoebaIndex);
    }
    amoeba.remove();
    const smallers = this._multiplyAmoeba(amoeba);
    smallers.forEach(a => {
      a.add(this._scene);
      this._amoebas.push(a);
    }
    );
  }

  private _multiplyAmoeba(amoeba: Amoeba) {
    if (amoeba.size === 3) {
      // make mediums
      const startPosition = { ...amoeba.position };
      // add smaller ones
      const a1 = new AmoebaMedium({ velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() }, initialPosition: { ...startPosition } });
      const a2 = new AmoebaMedium({ velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() }, initialPosition: { ...startPosition } });
      const a3 = new AmoebaMedium({ velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() }, initialPosition: { ...startPosition } });

      a1.setBoundary(this._boundary);
      a2.setBoundary(this._boundary);
      a3.setBoundary(this._boundary);

      return [a1, a2, a3];
    }
    if (amoeba.size === 2) {
      const startPosition = { ...amoeba.position };
      // add smaller ones
      const a1 = new AmoebaSmall({ velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() }, initialPosition: { ...startPosition } });
      const a2 = new AmoebaSmall({ velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() }, initialPosition: { ...startPosition } });
      const a3 = new AmoebaSmall({ velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() }, initialPosition: { ...startPosition } });

      a1.setBoundary(this._boundary);
      a2.setBoundary(this._boundary);
      a3.setBoundary(this._boundary);

      return [a1, a2, a3];
    }
    return [];
  }

  private _addStar() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const x = Math.round(Math.random() * width) - (width / 2);
    const y = Math.round(Math.random() * height) - (height / 2);
    const size = Math.random() * 2;

    const geometry = new THREE.CircleGeometry(size, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff88 });
    const circle = new THREE.Mesh(geometry, material);

    circle.position.set(x, -1, y);
    circle.rotation.x = -Math.PI / 2;
    this._scene.add(circle);
  }

  private _getRandomAmoebaVelocityFactor() {
    return (Math.random() * 0.8) - 0.4;
  }
}
