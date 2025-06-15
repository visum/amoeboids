import * as THREE from 'three';
import { TextGeometry, Font } from 'three/examples/jsm/Addons.js';

export enum TextMode {
  "welcome",
  "play",
  "over",
  "pause",
};

const SCORE_HEIGHT = 15;

export class TextOverlay {
  private _scene: THREE.Scene;

  private _font: Font;
  // left, right, top, bottom
  private _bounds: [number, number, number, number];

  private _scoreMesh?: THREE.Mesh;
  private _welcomeMesh: THREE.Mesh;
  private _instructionMesh: THREE.Mesh;
  private _gameOverMesh: THREE.Mesh;
  private _pauseMesh: THREE.Mesh;

  constructor(scene: THREE.Scene, font: Font, bounds: [number, number, number, number]) {
    this._scene = scene;
    this._font = font;
    this._bounds = bounds;

    this._welcomeMesh = this._makeWelcomeMesh();
    this._gameOverMesh = this._makeOverMesh();
    this._pauseMesh = this._makePauseMesh();
    this._instructionMesh = this._makeInstructionMesh();
  }

  setMode(mode: TextMode) {
    if (mode === TextMode.welcome) {
      this._setWelcomeMode();
    }
    if (mode === TextMode.play) {
      this._setPlayMode();
    }
    if (mode === TextMode.over) {
      this._setOverMode();
    }
    if (mode === TextMode.pause) {
      this._setPausedMode();
    }
  }

  setScore(newScore: number) {

    const oldMesh = this._scoreMesh;
    if (oldMesh) {
      this._scene.remove(oldMesh);
    }
    // I guess we have to make a new mesh?
    const geometry = new TextGeometry(`Score: ${newScore}`, {
      font: this._font,
      size: SCORE_HEIGHT,
      depth: 2,
    });
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this._scoreMesh = new THREE.Mesh(geometry, material);
    this._scoreMesh.position.set(this._bounds[0] + 10, 0, this._bounds[3] + (SCORE_HEIGHT + 10));
    this._scoreMesh.rotation.x = -Math.PI / 2;
    this._scene.add(this._scoreMesh);
  }

  private _makeWelcomeMesh() {
    const geometry = new TextGeometry('AMOEBOIDS', {
      font: this._font,
      size: 80,
      depth: 2
    });
    const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const welcomeMesh = new THREE.Mesh(geometry, material);
    welcomeMesh.position.set(-300, 0, 30);
    welcomeMesh.rotation.x = -Math.PI / 2;
    return welcomeMesh;
  }

  private _makeOverMesh() {
    const geometry = new TextGeometry('Game Over', {
      font: this._font,
      size: 60,
      depth: 2
    });
    const material = new THREE.MeshBasicMaterial({ color: 0xaa4444 });
    const gameOverMesh = new THREE.Mesh(geometry, material);
    gameOverMesh.position.set(-200, 0, 30);
    gameOverMesh.rotation.x = -Math.PI / 2;
    return gameOverMesh;
  }

  private _makePauseMesh() {
    const geometry = new TextGeometry('Paused', {
      font: this._font,
      size: 60,
      depth: 2
    });
    const material = new THREE.MeshBasicMaterial({ color: 0xaa4444 });
    const pauseMesh = new THREE.Mesh(geometry, material);
    pauseMesh.position.set(-300, 0, 30);
    pauseMesh.rotation.x = -Math.PI / 2;
    return pauseMesh;

  }

  private _makeInstructionMesh() {
    const geometry = new TextGeometry('Press Enter/Return to Start', {
      font: this._font,
      size: 30,
      depth: 2
    });
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instructionMesh = new THREE.Mesh(geometry, material);
    instructionMesh.position.set(-220, 0, 100);
    instructionMesh.rotation.x = -Math.PI / 2;
    return instructionMesh;

  }


  private _setWelcomeMode() {
    this._scene.add(this._welcomeMesh);
    this._scene.add(this._instructionMesh);
    this._scene.remove(this._gameOverMesh);
    this._scene.remove(this._pauseMesh);
  }

  private _setPlayMode() {
    this._scene.remove(this._welcomeMesh);
    this._scene.remove(this._instructionMesh);
    this._scene.remove(this._gameOverMesh);
    this._scene.remove(this._pauseMesh);
  }

  private _setOverMode() {
    this._scene.add(this._gameOverMesh);
    this._scene.add(this._instructionMesh);
    this._scene.remove(this._pauseMesh);
    this._scene.remove(this._welcomeMesh);
  }

  private _setPausedMode() {
    this._scene.add(this._pauseMesh);
    this._scene.add(this._instructionMesh);
    this._scene.remove(this._welcomeMesh);
    this._scene.remove(this._gameOverMesh);
  }
}
