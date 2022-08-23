/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable no-case-declarations */
/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
// @ts-nocheck

//<!-- build-remove-start -->
import * as BABYLON from "babylonjs";
import * as ZapparBabylon from "../../../src/index";
//<!-- build-remove-end -->

import faceImageSource from "../../assets/jest/camera-sources/face-target.jpg";
import targetImageImageSource from "../../assets/jest/camera-sources/image-target.jpg";
import scenePlaneTexture from "../../assets/scene.jpg";
import cameraPlaneTexture from "../../assets/camera.jpg";
import targetPlaneTexture from "../../assets/target.jpg";
// eslint-disable-next-line import/no-webpack-loader-syntax
// eslint-disable-next-line import/no-unresolved
const sourceUrl = require("file-loader!../../assets/jest/camera-sources/instant-tracking.uar").default;

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

export const setCameraSource = (type) => {
  // type : "image" | "instant" | "face"
  // eslint-disable-next-line default-case
  switch (type) {
    case "targetImage":
    case "face":
      img.src = type === "face" ? faceImageSource : targetImageImageSource;
      img.onload = () => {
        camera.start();
      };
      break;

    case "instant":
      const sequenceSource = new ZapparBabylon.SequenceSource(camera.pipeline);

      fetch(sourceUrl).then(async (resp) => {
        sequenceSource.load(await resp.arrayBuffer());

        sequenceSource.start();
      });
      break;
  }
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

// Adapted from: https://github.com/fheyen/dynamic-time-warping-2

export class DynamicTimeWarping {
  constructor(ts1, ts2, distanceFunction) {
    this.ser1 = ts1;

    this.ser2 = ts2;

    this.distFunc = distanceFunction;

    this.distance = null;

    this.matrix = null;

    this.path = null;
  }

  getDistance() {
    if (this.distance !== null) {
      return this.distance;
    }

    this.matrix = [];

    for (let i = 0; i < this.ser1.length; i++) {
      this.matrix[i] = [];

      for (let j = 0; j < this.ser2.length; j++) {
        let cost = Infinity;
        if (i > 0) {
          cost = Math.min(cost, this.matrix[i - 1][j]);
          if (j > 0) {
            cost = Math.min(cost, this.matrix[i - 1][j - 1]);

            cost = Math.min(cost, this.matrix[i][j - 1]);
          }
        } else if (j > 0) {
          cost = Math.min(cost, this.matrix[i][j - 1]);
        } else {
          cost = 0;
        }

        this.matrix[i][j] = cost + this.distFunc(this.ser1[i], this.ser2[j]);
      }
    }

    this.distance = this.matrix[this.ser1.length - 1][this.ser2.length - 1];

    return this.distance;
  }
}
