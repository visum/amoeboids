import * as THREE from "three";
import { Ship } from "./things/ship.js";
import { Amoeba } from "./things/amoeba.js";
import { KeyboardController } from "./keyboard-controller.js";

export interface GameOptions {
  canvas: HTMLCanvasElement;
}

export class Amoeboids {
  private _scene: THREE.Scene;
  private _camera: THREE.OrthographicCamera;
  private _renderer: THREE.WebGLRenderer;
  private _ship: Ship;
  private _amoebas: Amoeba[] = [];
  private _running = false;
  private _tickHandler: () => void = () => { };
  private _keyboardController: KeyboardController;

  constructor(options: GameOptions) {
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xffffff);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
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
    this._ship.add(this._scene);

    const a1 = new Amoeba({ initialPosition: { x: 200, y: 300 }, scene: this._scene });
    const a2 = new Amoeba({ initialPosition: { x: -100, y: -60 }, scene: this._scene });
    a1.add(this._scene);
    a2.add(this._scene);

    this._amoebas.push(a1, a2);

    this._keyboardController = new KeyboardController(window.document.body, {
      onFire: () => { },
      onTurnR: () => {
        this._ship.turn(0.1);
      },
      onTurnL: () => {
        this._ship.turn(-0.1);
      },
      onAccel: () => {
        this._ship.accel(0.5);
      }
    });

    this._keyboardController.attach();
  }

  start() {
    this._running = true;
    // todo abstract this away
    this._tickHandler = this.tick.bind(this);
    window.requestAnimationFrame(this._tickHandler);
  }

  tick() {
    if (this._running) {
      this._keyboardController.process();
      this.update();
      this._renderer.render(this._scene, this._camera);
      window.requestAnimationFrame(this._tickHandler);
    }
  }

  public update(): void {
    this._ship.update();
    this._amoebas.forEach(a => a.update());
  }
}
