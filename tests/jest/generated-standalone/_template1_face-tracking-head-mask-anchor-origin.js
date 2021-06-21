/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//

import { scene, engine, camera, setCameraSource, targetPlane } from "./common";

setCameraSource("face");
camera.poseMode = ZapparBabylon.CameraPoseMode.AnchorOrigin;

const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode("tracker", camera, faceTracker, scene);
const material = new BABYLON.StandardMaterial("mat", scene);

material.emissiveColor = new BABYLON.Color3(1, 1, 1);
material.disableLighting = true;

const headMaskMesh = new ZapparBabylon.HeadMaskMeshLoader("headMask", scene).load();

headMaskMesh.parent = trackerTransformNode;
targetPlane.parent = trackerTransformNode;

const box = BABYLON.Mesh.CreateBox("name", 1, scene, false, BABYLON.Mesh.DOUBLESIDE);
box.parent = trackerTransformNode;
box.scaling.x = 5;
box.scaling.y = 5;

faceTracker.onNewAnchor.bind((anchor) => {
  camera.poseAnchorOrigin = anchor;
  setTimeout(() => {
    console.log("Anchor is visible");
  }, 500);
});

engine.runRenderLoop(() => {
  headMaskMesh.updateFromFaceTracker(faceTracker);
  scene.render();
});
