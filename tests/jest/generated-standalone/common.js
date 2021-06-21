/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//

import faceImageSource from "../../assets/jest/camera-sources/face-target.jpg";
import targetImageImageSource from "../../assets/jest/camera-sources/image-target.jpg";
import scenePlaneTexture from "../../assets/scene.jpg";
import cameraPlaneTexture from "../../assets/camera.jpg";
import targetPlaneTexture from "../../assets/target.jpg";

ZapparBabylon.setLogLevel(ZapparBabylon.LogLevel.LOG_LEVEL_VERBOSE);

const canvasHolder = document.querySelector("#canvas-holder") || document.createElement("div");
export const canvas = document.createElement("canvas");

canvasHolder.appendChild(canvas);

export const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
export const scene = new BABYLON.Scene(engine);

const scenePlaneMat = new BABYLON.StandardMaterial("", scene);
const targetPlaneMat = new BABYLON.StandardMaterial("", scene);
const cameraPlaneMat = new BABYLON.StandardMaterial("", scene);

scenePlaneMat.disableLighting = true;
targetPlaneMat.disableLighting = true;
cameraPlaneMat.disableLighting = true;

scenePlaneMat.emissiveTexture = new BABYLON.Texture(scenePlaneTexture, scene);
targetPlaneMat.emissiveTexture = new BABYLON.Texture(targetPlaneTexture, scene);
cameraPlaneMat.emissiveTexture = new BABYLON.Texture(cameraPlaneTexture, scene);

scenePlaneMat.alpha = 0.75;
targetPlaneMat.alpha = 0.75;
cameraPlaneMat.alpha = 0.75;

const f = new BABYLON.Vector4(0, 0, 1, 1); // ?:ish
const b = new BABYLON.Vector4(0, 0, 1, 1);

export const scenePlane = BABYLON.MeshBuilder.CreatePlane(
  "scene plane",
  {
    height: 0.25,
    width: 1,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    frontUVs: f,
    backUVs: b,
  },
  scene
);
export const targetPlane = BABYLON.MeshBuilder.CreatePlane(
  "target plane",
  {
    height: 0.25,
    width: 1,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    frontUVs: f,
    backUVs: b,
  },
  scene
);
export const cameraPlane = BABYLON.MeshBuilder.CreatePlane(
  "camera plane",
  {
    height: 0.25,
    width: 1,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    frontUVs: f,
    backUVs: b,
  },
  scene
);

const img = document.createElement("img");

export const camera = new ZapparBabylon.Camera("camera", scene, {
  rearCameraSource: img,
});

// @ts-ignore
export const setCameraSource = (type) => {
  img.src = type === "face" ? faceImageSource : targetImageImageSource;
};

img.onload = () => {
  camera.start();
};

scenePlane.material = scenePlaneMat;
targetPlane.material = targetPlaneMat;
cameraPlane.material = cameraPlaneMat;

cameraPlane.position.set(0, 0, 5);
cameraPlane.parent = camera;
scenePlane.position.set(0, -0.5, 5);

window.addEventListener("resize", () => {
  engine.resize();
});
engine.runRenderLoop(() => {
  if (camera.poseMode === ZapparBabylon.CameraPoseMode.AnchorOrigin) {
    scenePlane.position.set(0, -0.5, 0);
  } else {
    scenePlane.position.set(0, -0.5, 5);
  }
  camera.updateFrame();
});
