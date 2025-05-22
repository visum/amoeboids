import * as THREE from "three";

export interface Thing {
  position: {x:number, y:number};
  add(scene:THREE.Scene):void;
  remove():void;
  update():void; 
}