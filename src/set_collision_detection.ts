import type { Collidable } from "./types/collidable";

export class SetCollissionDetection {
  private _sourceMesh: Collidable;
  private _targets: Set<Collidable>;

  constructor(source: Collidable, targets: Set<Collidable>) {
    this._sourceMesh = source;
    this._targets = targets;
  }

  process(): Collidable[] {
    const result: Collidable[] = [];
    for (const c of this._targets) {
      if (this._doesCollide(this._sourceMesh, c)) {
        result.push(c);
      }
    }
    return result;
  }

  private _doesCollide(a: Collidable, b: Collidable) {
    const dX = a.position.x - b.position.x;
    const dY = a.position.y - b.position.y;
    const distance = Math.sqrt(dX * dX + dY * dY);
    return distance < (a.collisionRadius + b.collisionRadius);
  }
}
