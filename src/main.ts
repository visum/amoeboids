// src/main.ts
import { Amoeboids } from './game.js';
export function startGame() {

  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;

  const game = new Amoeboids({ canvas });

  game.start();

}
