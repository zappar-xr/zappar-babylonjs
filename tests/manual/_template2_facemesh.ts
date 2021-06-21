/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */

import * as BABYLON from "babylonjs";
import { _BabylonLoaderRegistered } from "babylonjs";
import * as Stats from "stats.js";
import faceMeshTexture from "../assets/faceMeshTemplate.png";
import * as ZapparBabylon from "../../src/index";
import { scene, engine, camera, targetPlane } from "./common";

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode("tracker", camera, faceTracker, scene);

const material = new BABYLON.StandardMaterial("mat", scene);
material.emissiveTexture = new BABYLON.Texture(faceMeshTexture, scene);
material.disableLighting = true;
const faceMesh = new ZapparBabylon.FaceMeshGeometry("faceMesh", scene);
faceMesh.parent = trackerTransformNode;
faceMesh.material = material;
// material.backFaceCulling = false;

faceTracker.onNewAnchor.bind((anchor) => {
  camera.poseAnchorOrigin = anchor;
});

targetPlane.parent = trackerTransformNode;

engine.runRenderLoop(() => {
  stats.begin();
  faceMesh.updateFromFaceTracker(faceTracker);
  scene.render();
  stats.end();
});
