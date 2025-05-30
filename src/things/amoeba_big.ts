import { Amoeba } from "./amoeba";

export class AmoebaBig extends Amoeba {

  size = 3;

  constructor({ initialPosition, velocity }: { initialPosition: { x: number, y: number }, velocity: { x: number, y: number } }) {
    super({ initialPosition, velocity, radius: 40 });
  }
}
