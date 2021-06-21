/* eslint-disable import/prefer-default-export */
/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */
import * as BABYLON from "babylonjs";
import * as ZapparBabylon from "../../src/index";
import scenePlaneTexture from "../assets/scene.jpg";
import cameraPlaneTexture from "../assets/camera.jpg";
import targetPlaneTexture from "../assets/target.jpg";

const canvasHolder = document.querySelector("#canvas-holder") || document.createElement("div");
export const canvas = document.createElement("canvas");
canvasHolder.appendChild(canvas);
export const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
export const scene = new BABYLON.Scene(engine);
// scene.debugLayer.show();
const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, -Math.PI / 4), scene);
export const camera = new ZapparBabylon.Camera("camera", scene);

ZapparBabylon.permissionRequestUI().then((granted) => {
  if (granted) camera.start(true);
  else ZapparBabylon.permissionDeniedUI();
});

const scenePlaneMat = new BABYLON.StandardMaterial("", scene);
const targetPlaneMat = new BABYLON.StandardMaterial("", scene);
const cameraPlaneMat = new BABYLON.StandardMaterial("", scene);
scenePlaneMat.disableLighting = true;
targetPlaneMat.disableLighting = true;
cameraPlaneMat.disableLighting = true;

scenePlaneMat.emissiveTexture = new BABYLON.Texture(scenePlaneTexture, scene);
targetPlaneMat.emissiveTexture = new BABYLON.Texture(targetPlaneTexture, scene);
cameraPlaneMat.emissiveTexture = new BABYLON.Texture(cameraPlaneTexture, scene);

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

scenePlane.material = scenePlaneMat;
targetPlane.material = targetPlaneMat;
cameraPlane.material = cameraPlaneMat;

cameraPlane.position.set(0, 0, 5);
cameraPlane.parent = camera;
scenePlane.position.set(0, -0.5, 5);

const cameraSelect = (document.querySelector("#cameraSelect") as HTMLSelectElement) || document.createElement("select");
cameraSelect.addEventListener("change", () => camera.start(cameraSelect.value === "userFacing"));

const mirrorSelect = (document.querySelector("#mirrorSelect") as HTMLSelectElement) || document.createElement("select");
mirrorSelect.addEventListener("change", () => {
  switch (mirrorSelect.value) {
    case "css":
      camera.rearCameraMirrorMode = ZapparBabylon.CameraMirrorMode.CSS;
      camera.userCameraMirrorMode = ZapparBabylon.CameraMirrorMode.CSS;
      break;
    case "poses":
      camera.rearCameraMirrorMode = ZapparBabylon.CameraMirrorMode.Poses;
      camera.userCameraMirrorMode = ZapparBabylon.CameraMirrorMode.Poses;
      break;
    case "nomirror":
      camera.rearCameraMirrorMode = ZapparBabylon.CameraMirrorMode.None;
      camera.userCameraMirrorMode = ZapparBabylon.CameraMirrorMode.None;
      break;
    default:
      break;
  }
});

const poseSelect = (document.querySelector("#poseSelect") as HTMLSelectElement) || document.createElement("select");
poseSelect.addEventListener("change", () => {
  switch (poseSelect.value) {
    case "default":
      camera.poseMode = ZapparBabylon.CameraPoseMode.Default;
      break;
    case "attitude":
      camera.poseMode = ZapparBabylon.CameraPoseMode.Attitude;
      break;
    case "anchor":
      camera.poseMode = ZapparBabylon.CameraPoseMode.AnchorOrigin;
      break;
    default:
      break;
  }
});

window.addEventListener("resize", () => {
  engine.resize();
});
engine.runRenderLoop(() => {
  camera.updateFrame();
  if (camera.poseMode === ZapparBabylon.CameraPoseMode.AnchorOrigin) {
    scenePlane.position.set(0, -0.5, 0);
  } else {
    scenePlane.position.set(0, -0.5, 5);
  }
});
