export class KeyboardController {
  private _element: HTMLElement;
  private _handlers: {
    onAccel: () => void,
    onDeccel: () => void,
    onTurnL: () => void,
    onTurnR: () => void,
    onFire: () => void,
    onPause: () => void,
    onStart: () => void,
  }

  private _latches = new Set<string>();

  constructor(element: HTMLElement, handlers: {
    onAccel: () => void,
    onDeccel: () => void,
    onTurnL: () => void,
    onTurnR: () => void,
    onFire: () => void,
    onPause: () => void,
    onStart: () => void,
  }) {
    this._element = element;
    this._handlers = handlers;
  }

  attach() {
    this._element.addEventListener("keydown", this._downObserver);
    this._element.addEventListener("keyup", this._upObserver);
  }

  detach() {
    this._element.removeEventListener("keydown", this._downObserver);
    this._element.removeEventListener("keyup", this._downObserver);
  }

  process() {
    this._latches.has("accel") && this._handlers.onAccel();
    this._latches.has("deccel") && this._handlers.onDeccel();
    this._latches.has("turnL") && this._handlers.onTurnL();
    this._latches.has("turnR") && this._handlers.onTurnR();
    this._latches.has("fire") && this._handlers.onFire();
  }

  private _downObserver = (e: KeyboardEvent) => {
    switch (e.key) {
      case "w": {
        this._latches.add("accel");
        break;
      }
      case "s": {
        this._latches.add("deccel");
        break;
      }
      case "a": {
        this._latches.add("turnL");
        break;
      }
      case "d": {
        this._latches.add("turnR");
        break;
      }
      case " ": {
        this._latches.add("fire");
        break;
      }
      case "Escape": {
        this._handlers.onPause();
        break;
      }
      case "Enter": {
        this._handlers.onStart();
        break;
      }
    }
  }

  private _upObserver = (e: KeyboardEvent) => {
    switch (e.key) {
      case "w": {
        this._latches.delete("accel");
        break;
      }
      case "s": {
        this._latches.delete("deccel");
        break;
      }
      case "a": {
        this._latches.delete(("turnL"));
        break;
      }
      case "d": {
        this._latches.delete(("turnR"));
        break;
      }
      case " ": {
        this._latches.delete("fire");
      }
    }
  };
}
