import * as THREE from "three";
import type { Thing } from "./thing.js";
import type { Mobile } from "./mobile.js";

export class Ship implements Thing, Mobile {
  private _position: { x: number; y: number } = { x: 0, y: 0 };
  private _velocity: { x: number; y: number } = { x: 0, y: 0.1 };
  private _scene?: THREE.Scene;

  private _drawables: THREE.Object3D[] = [];

  get position() {
    return this._position;
  }

  get velocity() {
    return this._velocity;
  }

  update() {
    const ship = this._drawables[0];
    const pos = ship.position;
    pos.set(pos.x + this._velocity.x, 0, pos.y + this._velocity.y);
  }

  add(scene: THREE.Scene) {
    this._scene = scene;
    const triangleGeometry = new THREE.BufferGeometry();

    // Define triangle vertices (in 2D game coordinates, but positioned in 3D space)
    const vertices = new Float32Array([
      0, 0, 20,  // top vertex    (x=0,   y=0, z=50)
      -10, 0, -10,  // bottom left   (x=-50, y=0, z=-50)  
      10, 0, -10   // bottom right  (x=50,  y=0, z=-50)
    ]);

    triangleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // Create material (black color)
    const triangleMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide // Make sure triangle is visible from both sides
    });

    const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
    scene.add(triangle);
    this._drawables.push(triangle);
  }

  remove() {
    const scene = this._scene;
    if (!scene) {
      return;
    }
    scene.remove(...this._drawables);
  }
}
