import type { Collidable } from "./types/collidable";

export class CollissionDetection {
  private _sourceMesh: Collidable;
  private _targets: Collidable[];

  constructor(source: Collidable, targets: Collidable[]) {
    this._sourceMesh = source;
    this._targets = targets;
  }

  // returns indexes of colliding target meshes
  process(): number[] {
    const collisions = [];

    for (let i = 0; i < this._targets.length; i++) {
      if (this._doesCollide(this._sourceMesh, this._targets[i])) {
        collisions.push(i);
      }
    }
    return collisions;
  }

  private _doesCollide(a: Collidable, b: Collidable) {
    const dX = a.position.x - b.position.x;
    const dY = a.position.y - b.position.y;
    const distance = Math.sqrt(dX * dX + dY * dY);
    return distance < (a.collisionRadius + b.collisionRadius);
  }
}
