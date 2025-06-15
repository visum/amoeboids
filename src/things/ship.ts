import * as THREE from "three";
import type { Collidable } from "../types/collidable";

export class Ship implements Collidable {
  private _velocity: { x: number; y: number } = { x: 0, y: 0 };
  private _posX: number = 0;
  private _posY: number = 0;
  private _scene?: THREE.Scene;
  private _heading: number = 0; // in rad

  private _drawables: THREE.Object3D[] = [];

  private _radius = 15;

  private _boundary: [number, number, number, number] = [-100, 100, 100, -100];

  get collisionRadius() {
    return this._radius;
  }

  get position() {
    return {
      x: this._drawables[0].position.x,
      y: this._drawables[0].position.z,
    };
  }

  get velocity() {
    return this._velocity;
  }

  reset() {
    this._velocity = { x: 0, y: 0 };
    this._heading = 0;
    this._posX = 0;
    this._posY = 0;
    this.update();
  }

  setBoundary(boundary: [number, number, number, number]) {
    this._boundary = boundary;
  }

  getVector() {
    const speed = Math.sqrt(this._velocity.x * this._velocity.x + this._velocity.y * this._velocity.y);
    const angle = Math.atan2(this._velocity.x, this._velocity.y);

    return { speed, angle };
  }

  getHeading() {
    return this._heading;
  }

  update() {
    const ship = this._drawables[0];
    const pos = ship.position;

    let x = this._posX + this._velocity.x;
    let y = this._posY + this._velocity.y;

    if (x < this._boundary[0]) {
      x = this._boundary[1];
    }
    if (x > this._boundary[1]) {
      x = this._boundary[0];
    }
    if (y < this._boundary[3]) {
      y = this._boundary[2];
    }
    if (y > this._boundary[2]) {
      y = this._boundary[3];
    }

    this._posX = x;
    this._posY = y;

    ship.rotation.y = this._heading;

    pos.set(this._posX, 1, this._posY);
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
      color: 0xffffff,
      side: THREE.DoubleSide // Make sure triangle is visible from both sides
    });

    const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);

    triangle.position.set(0, 1, 0);
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

  accel(delta: number) {

    const vX = Math.sin(this._heading) * delta;
    const vY = Math.cos(this._heading) * delta;

    this._velocity.x += vX;
    this._velocity.y += vY;
  }

  turn(delta: number) { // in rad
    this._heading -= delta;
  }
}
