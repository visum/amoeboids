import * as THREE from "three";
import type { Thing } from "./thing";
import type { Mobile } from "./mobile";

export class Amoeba implements Thing, Mobile {
  private _x: number;
  private _y: number;
  private _vX: number = 0;
  private _vY: number = 0;

  private _originalVertices: Float32Array;
  private _time: number = 0;

  private _scene: THREE.Scene;

  private _mesh: THREE.Mesh;

  constructor({ initialPosition, scene }: { initialPosition: { x: number, y: number }, scene: THREE.Scene }) {
    this._scene = scene;
    this._x = initialPosition.x;
    this._y = initialPosition.y;

    const geometry = this._createBlobGeometry();
    this._originalVertices = geometry.getAttribute('position').array.slice() as Float32Array;
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide
    });

    this._mesh = new THREE.Mesh(geometry, material);

    this._mesh.position.set(this._x, 0, this._y);
  }

  get position() {
    return { x: this._x, y: this._y };
  }

  get velocity() {
    return { x: this._vX, y: this._vY };
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
  }

  add(scene: THREE.Scene) {
    this._scene = scene;

    scene.add(this._mesh);
  }

  remove() {
    this._scene.remove(this._mesh);
  }

  private _createBlobGeometry() {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const segments = 12;
    const radius = 40;

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
