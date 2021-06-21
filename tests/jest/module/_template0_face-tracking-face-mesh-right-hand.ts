/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//<!-- build-remove-start -->
import * as BABYLON from "babylonjs";
import * as ZapparBabylon from "../../../src/index";
//<!-- build-remove-end -->

import faceMeshTexture from "../../assets/faceMeshTemplate.png";
import { scene, engine, camera, setCameraSource, targetPlane } from "./common";

setCameraSource("face");
scene.useRightHandedSystem = true;

const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode("tracker", camera, faceTracker, scene);
const material = new BABYLON.StandardMaterial("mat", scene);
material.emissiveTexture = new BABYLON.Texture(faceMeshTexture, scene);
material.disableLighting = true;

const faceMesh = new ZapparBabylon.FaceMeshGeometry("faceMesh", scene);

faceMesh.parent = trackerTransformNode;
faceMesh.material = material;

targetPlane.parent = trackerTransformNode;

faceTracker.onNewAnchor.bind(() => {
  setTimeout(() => {
    console.log("Anchor is visible");
  }, 500);
});

engine.runRenderLoop(() => {
  faceMesh.updateFromFaceTracker(faceTracker);
  scene.render();
});
