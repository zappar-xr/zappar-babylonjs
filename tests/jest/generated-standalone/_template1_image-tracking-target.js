/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//

import { scene, engine, camera, setCameraSource, targetPlane, cameraPlane, scenePlane } from "./common";
import targetImage from "../../assets/jest/zpt/target.zpt";

setCameraSource("targetImage");

const imageTracker = new ZapparBabylon.ImageTrackerLoader().load(targetImage);
const trackerTransformNode = new ZapparBabylon.ImageAnchorTransformNode("tracker", camera, imageTracker, scene);

targetPlane.parent = trackerTransformNode;

// avoid some z fighting
//@ts-ignore
cameraPlane.material.depthFunction = BABYLON.Engine.ALWAYS;
//@ts-ignore
scenePlane.material.depthFunction = BABYLON.Engine.ALWAYS;
//@ts-ignore
targetPlane.material.depthFunction = BABYLON.Engine.ALWAYS;

imageTracker.onNewAnchor.bind(() => {
  const previewMesh = new ZapparBabylon.TargetImagePreviewMesh("preview mesh", scene, imageTracker.targets[0]);
  previewMesh.parent = trackerTransformNode;
  setTimeout(() => {
    console.log("Anchor is visible");
  }, 500);
});

engine.runRenderLoop(() => {
  scene.render();
});
