export class Clock {
  private _running = false;
  private _onTick: () => void;

  private _handleTick: () => void;

  constructor(onTick: () => void) {
    this._onTick = onTick;
    this._handleTick = this.tick.bind(this);
  }

  start() {
    this._running = true;

    window.requestAnimationFrame(this._handleTick);
  }

  pause() {
    this._running = false;
  }

  tick() {
    if (this._running) {
      this._onTick();
      window.requestAnimationFrame(this._handleTick);
    }
  }
}
