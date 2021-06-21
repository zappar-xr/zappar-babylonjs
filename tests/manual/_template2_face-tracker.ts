/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */

import * as BABYLON from "babylonjs";

import * as ZapparBabylon from "../../src/index";
import { scene, engine, camera, targetPlane } from "./common";

camera.start(true);
const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode("tracker", camera, faceTracker, scene);

const box = BABYLON.Mesh.CreateBox("name", 1, scene, false);
box.parent = trackerTransformNode;
targetPlane.parent = trackerTransformNode;

faceTracker.onNewAnchor.bind((anchor) => {
  camera.poseAnchorOrigin = anchor;
});

engine.runRenderLoop(() => {
  scene.render();
});
