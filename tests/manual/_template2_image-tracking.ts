/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */

import * as BABYLON from "babylonjs";
import targetfile from "../assets/example-tracking-image.zpt";

import * as ZapparBabylon from "../../src/index";
import { scene, engine, camera, targetPlane } from "./common";

const imageTracker = new ZapparBabylon.ImageTrackerLoader().load(targetfile);
const trackerTransformNode = new ZapparBabylon.ImageAnchorTransformNode("tracker", camera, imageTracker, scene);

// const sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 0.2, scene, false, BABYLON.Mesh.DOUBLESIDE);
const box = BABYLON.Mesh.CreateBox("name", 1, scene, false, BABYLON.Mesh.DOUBLESIDE);
box.parent = trackerTransformNode;

imageTracker.onNewAnchor.bind((anchor) => {
  camera.poseAnchorOrigin = anchor;
});

targetPlane.parent = trackerTransformNode;

engine.runRenderLoop(() => {
  scene.render();
});
