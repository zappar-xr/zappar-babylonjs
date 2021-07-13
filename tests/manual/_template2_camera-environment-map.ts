/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */

import * as BABYLON from "babylonjs";

import * as ZapparBabylon from "../../src/index";
import { camera, engine, scene } from "./common";

const env = new ZapparBabylon.CameraEnvironmentMap(camera, engine);

const planeMaterial = new BABYLON.PBRMetallicRoughnessMaterial("mat", scene);
planeMaterial.environmentTexture = env.cubeTexture;
planeMaterial.roughness = 0;
planeMaterial.metallic = 1;

const sphere = BABYLON.MeshBuilder.CreateSphere("plane", {}, scene);
sphere.material = planeMaterial;
sphere.position.z = 5;

engine.runRenderLoop(() => {
  env.update();
  scene.render();
});
