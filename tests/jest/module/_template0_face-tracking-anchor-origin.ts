/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//<!-- build-remove-start -->
import * as ZapparBabylon from "../../../src/index";
//<!-- build-remove-end -->

import { scene, engine, camera, setCameraSource, targetPlane } from "./common";

setCameraSource("face");
camera.poseMode = ZapparBabylon.CameraPoseMode.AnchorOrigin;

const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode("tracker", camera, faceTracker, scene);

targetPlane.parent = trackerTransformNode;

faceTracker.onNewAnchor.bind((anchor) => {
  camera.poseAnchorOrigin = anchor;
  setTimeout(() => {
    console.log("Anchor is visible");
  }, 500);
});

engine.runRenderLoop(() => {
  scene.render();
});
