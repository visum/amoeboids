import * as THREE from "three";
import { Ship } from "./things/ship.js";
import { Amoeba } from "./things/amoeba.js";
import { AmoebaBig } from "./things/amoeba_big.js";
import { AmoebaMedium } from "./things/amoeba_medium.js";
import { AmoebaSmall } from "./things/amoeba_small.js";
import { KeyboardController } from "./keyboard-controller.js";
import { SetCollissionDetection } from "./set_collision_detection.js";
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
  private _amoebas = new Set<Amoeba>();
  private _keyboardController: KeyboardController;
  private _clock: Clock;
  private _bulletLastTime = 0;
  private _bullets = new Set<Bullet>();

  private _bulletMaxAge = 3_000; // ms

  private _shipCollisionDetector: SetCollissionDetection;
  private _bulletCollisionDetectors = new Map<Bullet, SetCollissionDetection>();

  private _level = 1;

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

    this.nextLevel();

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
        this._ship.accel(0.2);
      },
      onDeccel: () => {
        this._ship.accel(-0.1);
      }
    });

    this._keyboardController.attach();
    for (let i = 0; i <= 60; i++) {
      this._addStar();
    }

    this._shipCollisionDetector = new SetCollissionDetection(this._ship, this._amoebas);
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

    const oldBullets: Bullet[] = [];

    for (const b of this._bullets.values()) {
      if (b.age > this._bulletMaxAge) {
        oldBullets.push(b);
      }
    }

    for (const b of oldBullets) {
      this._bulletCollisionDetectors.delete(b)
      b.remove();
      this._bullets.delete(b);
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
        hitAmoebas.add(collisions[i] as Amoeba);
        hitBullets.add(b);
      }
    }

    for (const a of hitAmoebas.values()) {
      this._amoebaHit(a);
    }

    for (const b of hitBullets.values()) {
      this._bullets.delete(b);
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
    this._bullets.add(b);

    const cd = new SetCollissionDetection(b, this._amoebas);
    this._bulletCollisionDetectors.set(b, cd);
  }

  nextLevel() {
    this._level += 1;
    this._placeAmoebas(Math.round(this._level * 2.4));
  }

  private _placeAmoebas(count: number) {
    const shipPosition = this._ship.position;

    for (let i = 0; i < count; i++) {
      const amoebaPosition = this._getAmoebaPosition(shipPosition, 100);
      if (!amoebaPosition) {
        continue;
      }
      const a = new AmoebaBig({ initialPosition: amoebaPosition, velocity: { x: this._getRandomAmoebaVelocityFactor(), y: this._getRandomAmoebaVelocityFactor() } });
      a.setBoundary(this._boundary);
      this._amoebas.add(a);
      a.add(this._scene);
    }
  }

  private _getAmoebaPosition(shipPos: { x: number, y: number }, minDistance: number) {
    // boundary is left right top bottom
    const zones = [
      // left side
      { minX: this._boundary[0], maxX: shipPos.x - minDistance, minY: this._boundary[3], maxY: this._boundary[2] },
      // right side
      { minX: shipPos.x + minDistance, maxX: this._boundary[1], minY: this._boundary[3], maxY: this._boundary[2] },
      // top side
      { minX: this._boundary[0], maxX: this._boundary[1], minY: this._boundary[3], maxY: shipPos.y - minDistance },
      // bottom side
      { minX: this._boundary[0], maxX: this._boundary[1], minY: shipPos.y + minDistance, maxY: this._boundary[2] }
    ];

    const validZones = zones.filter(z => z.minX < z.maxX && z.minY < z.maxY);

    if (validZones.length === 0) {
      return;
    }

    const zone = validZones[Math.floor(Math.random() * validZones.length)];

    return {
      x: zone.minX + Math.random() * (zone.maxX - zone.minX),
      y: zone.minY + Math.random() * (zone.maxY - zone.minY)
    };
  }

  private _amoebaHit(amoeba: Amoeba) {
    this._amoebas.delete(amoeba);
    amoeba.remove();
    const smallers = this._multiplyAmoeba(amoeba);

    smallers.forEach(a => {
      a.add(this._scene);
      this._amoebas.add(a);
    }
    );

    if (this._amoebas.size === 0) {
      this.nextLevel();
    }
  }

  private _multiplyAmoeba(amoeba: Amoeba) {
    if (amoeba.size === 3) {
      // make mediums
      const startPosition = { ...amoeba.position };
      // add smaller ones
      const a1 = new AmoebaMedium({ velocity: { x: this._getRandomAmoebaVelocityFactor(2), y: this._getRandomAmoebaVelocityFactor(2) }, initialPosition: { ...startPosition } });
      const a2 = new AmoebaMedium({ velocity: { x: this._getRandomAmoebaVelocityFactor(2), y: this._getRandomAmoebaVelocityFactor(2) }, initialPosition: { ...startPosition } });
      const a3 = new AmoebaMedium({ velocity: { x: this._getRandomAmoebaVelocityFactor(2), y: this._getRandomAmoebaVelocityFactor(2) }, initialPosition: { ...startPosition } });

      a1.setBoundary(this._boundary);
      a2.setBoundary(this._boundary);
      a3.setBoundary(this._boundary);

      return [a1, a2, a3];
    }
    if (amoeba.size === 2) {
      const startPosition = { ...amoeba.position };
      // add smaller ones
      const a1 = new AmoebaSmall({ velocity: { x: this._getRandomAmoebaVelocityFactor(3), y: this._getRandomAmoebaVelocityFactor(3) }, initialPosition: { ...startPosition } });
      const a2 = new AmoebaSmall({ velocity: { x: this._getRandomAmoebaVelocityFactor(3), y: this._getRandomAmoebaVelocityFactor(3) }, initialPosition: { ...startPosition } });
      const a3 = new AmoebaSmall({ velocity: { x: this._getRandomAmoebaVelocityFactor(3), y: this._getRandomAmoebaVelocityFactor(3) }, initialPosition: { ...startPosition } });

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

  private _getRandomAmoebaVelocityFactor(multiplier = 1) {
    return ((Math.random() * 0.8) - 0.4) * multiplier;
  }
}
