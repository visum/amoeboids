import * as THREE from "three";
import type { Collidable } from "../types/collidable";

export abstract class Amoeba implements Collidable {
  private _originalVertices: Float32Array;
  private _time: number = 0;
  private _scene?: THREE.Scene;
  private _mesh: THREE.Mesh;
  private _veolcity: { x: number, y: number } = { x: 0, y: 0 };
  private _radius: number;
  // left, right, top, bottom 
  private _boundary: [number, number, number, number] = [-100, -100, 100, 100];

  abstract size: number;


  constructor({ initialPosition, velocity, radius }: { initialPosition: { x: number, y: number }, velocity: { x: number, y: number }, radius: number }) {
    this._radius = radius;
    const geometry = this._createBlobGeometry();
    this._originalVertices = geometry.getAttribute('position').array.slice() as Float32Array;
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide
    });

    this._veolcity = velocity;

    this._mesh = new THREE.Mesh(geometry, material);

    this._mesh.position.set(initialPosition.x, 0, initialPosition.y);
  }

  get collisionRadius() {
    return this._radius;
  }

  get position(): { x: number, y: number } {
    return {
      x: this._mesh.position.x,
      y: this._mesh.position.z,
    };
  }

  setBoundary(boundary: [number, number, number, number]) {
    this._boundary = boundary;
  }

  update() {
    this._time += 0.02;

    // Animate the blob by modifying vertex positions
    const positions = this._mesh.geometry.getAttribute('position');
    const array = positions.array as Float32Array;

    // Skip center vertex (index 0), animate outer vertices
    for (let i = 1; i < positions.count; i++) {
      const baseIndex = i * 3;
      const originalX = this._originalVertices[baseIndex];
      const originalZ = this._originalVertices[baseIndex + 2];

      // Add wobble effect
      const wobble = Math.sin(this._time + i * 0.5) * 5;
      array[baseIndex] = originalX + wobble;
      array[baseIndex + 2] = originalZ + wobble * 0.5;
    }
    positions.needsUpdate = true;

    let x = this._mesh.position.x += this._veolcity.x;
    // our y is THREE z
    let y = this._mesh.position.z += this._veolcity.y;

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

    this._mesh.position.set(x, 0, y);
  }

  add(scene: THREE.Scene) {
    this._scene = scene;

    scene.add(this._mesh);
  }

  remove() {
    this._scene?.remove(this._mesh);
  }

  private _createBlobGeometry() {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const segments = 12;
    const radius = this._radius;

    // Center vertex
    vertices.push(0, 0, 0);

    // Outer vertices
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const blobRadius = radius * (0.8 + Math.random() * 0.4);
      const x = Math.cos(angle) * blobRadius;
      const z = Math.sin(angle) * blobRadius;
      vertices.push(x, 0, z);
    }

    // Create triangles
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      indices.push(0, i + 1, next + 1);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setIndex(indices);

    return geometry;
  }
}
