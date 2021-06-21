/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */

import * as BABYLON from "babylonjs";

import * as ZapparBabylon from "../../src/index";
import { camera, engine, scene } from "./common";

engine.runRenderLoop(() => {
  scene.render();
});
