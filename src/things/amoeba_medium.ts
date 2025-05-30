import { Amoeba } from "./amoeba";

export class AmoebaMedium extends Amoeba {

  size = 2;

  constructor({ initialPosition, velocity }: { initialPosition: { x: number, y: number }, velocity: { x: number, y: number } }) {
    super({ initialPosition, velocity, radius: 20 });
  }
}
