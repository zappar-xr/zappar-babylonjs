/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */
import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as ZapparBabylon from "../../src/index";
import { HeadMaskMeshLoader } from "../../src/index";
import { scene, engine, camera, targetPlane } from "./common";
import helmet from "../assets/beard.glb";

camera.start(true);
const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode("tracker", camera, faceTracker, scene);

const headMaskMesh = new HeadMaskMeshLoader("headMask", scene).load();
headMaskMesh.parent = trackerTransformNode;

BABYLON.SceneLoader.ImportMesh(null, "", helmet, scene, (meshes, particleSystems, skeletons, animationGroups, transformNodes) => {
  meshes[0].parent = trackerTransformNode;
  meshes[0].scaling.x *= 0.45;
  meshes[0].scaling.y *= 0.45;
  meshes[0].scaling.z *= -0.45;
  meshes[0].rotation.z = 180;
  meshes[0].position.y -= 0.45;
  meshes[0].position.z = -0.6;
});

faceTracker.onNewAnchor.bind((anchor) => {
  camera.poseAnchorOrigin = anchor;
});

targetPlane.parent = trackerTransformNode;

engine.runRenderLoop(() => {
  headMaskMesh.updateFromFaceAnchorTransformNode(trackerTransformNode);

  scene.render();
});
