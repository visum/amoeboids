import * as THREE from "three";
import type { Collidable } from "../types/collidable.js";


export class Bullet implements Collidable {
  private _radius = 2;
  private _scene?: THREE.Scene;
  private _velocity: { x: number, y: number };
  private _position: { x: number, y: number };
  private _spawnTime = 0;

  private _mesh: THREE.Mesh;

  constructor({ initialPosition, speed, heading }: { initialPosition: { x: number, y: number }, speed: number, heading: number }) {

    this._velocity = {
      x: Math.sin(heading) * speed,
      y: Math.cos(heading) * speed,
    };


    this._position = initialPosition;

    const geometry = new THREE.CircleGeometry(2);

    const material = new THREE.MeshBasicMaterial({
      color: 0xff4444,
      side: THREE.DoubleSide
    });

    const bullet = new THREE.Mesh(geometry, material);
    bullet.position.set(initialPosition.x, 0, initialPosition.y);

    bullet.rotation.x = -Math.PI / 2;

    this._mesh = bullet;
  }

  get position() {
    return {
      x: this._mesh.position.x,
      y: this._mesh.position.z,
    }
  }

  get collisionRadius() {
    return this._radius;
  }

  get age() {
    return Date.now() - this._spawnTime;
  }

  add(scene: THREE.Scene) {
    this._scene = scene;
    this._spawnTime = Date.now();

    scene.add(this._mesh);
  }

  remove() {
    this._scene?.remove(this._mesh);
  }

  update() {
    this._position.x += this._velocity.x;
    this._position.y += this._velocity.y;

    this._mesh.position.set(this._position.x, 2, this._position.y);
  }

}
