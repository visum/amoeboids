import * as THREE from "three";

export class Ship {
  private _velocity: { x: number; y: number } = { x: 0, y: 0 };
  private _posX: number = 0;
  private _posY: number = 0;
  private _scene?: THREE.Scene;
  private _heading: number = 0; // in rad

  private _drawables: THREE.Object3D[] = [];

  update() {
    const ship = this._drawables[0];
    const pos = ship.position;

    this._posX += this._velocity.x;
    this._posY += this._velocity.y;

    ship.rotation.y = this._heading;

    pos.set(this._posX, 0, this._posY);
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
