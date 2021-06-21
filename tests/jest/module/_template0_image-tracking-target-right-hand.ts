/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
//<!-- build-remove-start -->
import * as ZapparBabylon from "../../../src/index";
//<!-- build-remove-end -->

import { scene, engine, camera, setCameraSource, targetPlane } from "./common";
import targetImage from "../../assets/jest/zpt/target.zpt";

scene.useRightHandedSystem = true;
setCameraSource("targetImage");

const imageTracker = new ZapparBabylon.ImageTrackerLoader().load(targetImage);
const trackerTransformNode = new ZapparBabylon.ImageAnchorTransformNode("tracker", camera, imageTracker, scene);

targetPlane.parent = trackerTransformNode;

imageTracker.onNewAnchor.bind(() => {
  setTimeout(() => {
    console.log("Anchor is visible");
  }, 500);
});

engine.runRenderLoop(() => {
  scene.render();
});
