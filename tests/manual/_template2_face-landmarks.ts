import * as BABYLON from "babylonjs";

import * as ZapparBabylon from "../../src/index";
import { scene, engine, camera } from "./common";

const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();

for (let i = 0; i < Object.keys(ZapparBabylon.FaceLandmarkName).length; i += 1) {
  const trackerTransformNode = new ZapparBabylon.FaceAnchorTransformNode("landmark", camera, faceTracker, i, scene);
  const box = BABYLON.Mesh.CreateBox("name", 0.05, scene, false);
  box.parent = trackerTransformNode;
}

camera.start(true);
faceTracker.onNewAnchor.bind((anchor) => {
  camera.poseAnchorOrigin = anchor;
});

engine.runRenderLoop(() => {
  scene.render();
});
