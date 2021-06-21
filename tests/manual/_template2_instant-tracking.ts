/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */

import * as BABYLON from "babylonjs";

import * as ZapparBabylon from "../../src/index";
import { scene, engine, camera, targetPlane } from "./common";

const instantWorldTracker = new ZapparBabylon.InstantWorldTracker();
const trackerTransformNode = new ZapparBabylon.InstantWorldAnchorTransformNode("tracker", camera, instantWorldTracker, scene);

// const sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 0.2, scene, false, BABYLON.Mesh.DOUBLESIDE);
const box = BABYLON.Mesh.CreateBox("name", 1, scene, false, BABYLON.Mesh.DOUBLESIDE);
box.parent = trackerTransformNode;

let hasPlaced = false;
const canvas = engine.getRenderingCanvas() || document.createElement("canvas");
canvas.addEventListener("click", () => {
  hasPlaced = true;
});
targetPlane.parent = trackerTransformNode;
engine.runRenderLoop(() => {
  if (!hasPlaced) {
    instantWorldTracker.setAnchorPoseFromCameraOffset(0, 0, -5);
  }
  if (camera.poseMode === ZapparBabylon.CameraPoseMode.AnchorOrigin) {
    box.position.set(0, -0.5, 0);
  } else {
    box.position.set(0, -0.5, 5);
  }
  scene.render();
});
