/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//

import { scene, engine, camera, setCameraSource, targetPlane } from "./common";
import targetImage from "../../assets/jest/zpt/target.zpt";

setCameraSource("targetImage");

camera.poseMode = ZapparBabylon.CameraPoseMode.AnchorOrigin;
const imageTracker = new ZapparBabylon.ImageTrackerLoader().load(targetImage);
const trackerTransformNode = new ZapparBabylon.ImageAnchorTransformNode("tracker", camera, imageTracker, scene);

targetPlane.parent = trackerTransformNode;

imageTracker.onNewAnchor.bind((anchor) => {
  camera.poseAnchorOrigin = anchor;
  setTimeout(() => {
    console.log("Anchor is visible");
  }, 500);
});

engine.runRenderLoop(() => {
  scene.render();
});
