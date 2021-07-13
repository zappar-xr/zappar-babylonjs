/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//<!-- build-remove-start -->
import * as BABYLON from "babylonjs";
import * as ZapparBabylon from "../../../src/index";
//<!-- build-remove-end -->

import { scene, engine, camera, setCameraSource, targetPlane, scenePlane, cameraPlane } from "./common";

targetPlane.visibility = 0;
scenePlane.visibility = 0;
cameraPlane.visibility = 0;

setCameraSource("face");
const env = new ZapparBabylon.CameraEnvironmentMap(camera, engine);

const sphereMaterial = new BABYLON.PBRMetallicRoughnessMaterial("mat", scene);
sphereMaterial.environmentTexture = env.cubeTexture;

sphereMaterial.roughness = 0;
sphereMaterial.metallic = 1;

const sphere = BABYLON.MeshBuilder.CreateSphere("plane", {}, scene);
sphere.material = sphereMaterial;
sphere.position.z = 2.5;

engine.runRenderLoop(() => {
  env.update();
  scene.render();
});
