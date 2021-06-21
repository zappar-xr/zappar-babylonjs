/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//

import { scene, engine, camera, setCameraSource, targetPlane } from "./common";

setCameraSource("face");

const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode("tracker", camera, faceTracker, scene);

targetPlane.parent = trackerTransformNode;

faceTracker.onNewAnchor.bind(() => {
  setTimeout(() => {
    console.log("Anchor is visible");
  }, 500);
});

engine.runRenderLoop(() => {
  scene.render();
});
