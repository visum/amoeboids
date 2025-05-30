import { Amoeba } from "./amoeba";

export class AmoebaSmall extends Amoeba {

  size = 1;

  constructor({ initialPosition, velocity }: { initialPosition: { x: number, y: number }, velocity: { x: number, y: number } }) {
    super({ initialPosition, velocity, radius: 10 }
    );
  }

}
