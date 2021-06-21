import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import * as ZapparBabylon from "../../src/index";

const engine = new BABYLON.Engine(document.createElement("canvas"), true, { preserveDrawingBuffer: true, stencil: true });
const scene = new BABYLON.Scene(engine);
const babylonCamera = new BABYLON.Camera("camera1", new BABYLON.Vector3(0, 0, 0), scene);

const zapparCamera = new ZapparBabylon.Camera("camera", scene);
ZapparBabylon.permissionRequestUI().then((granted) => {
  if (granted) zapparCamera.start();
  else ZapparBabylon.permissionDeniedUI();
});

// eslint-disable-next-line no-unused-vars
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

const faceColors = new Array(3);
faceColors[0] = new BABYLON.Color3(1);
faceColors[1] = new BABYLON.Color3(1, 1);
faceColors[2] = new BABYLON.Color3(1, 1, 1);
faceColors[3] = new BABYLON.Color3(0, 1);
faceColors[4] = new BABYLON.Color3(0, 1, 1);
faceColors[5] = new BABYLON.Color3(0, 0, 1);

const boxMaterial = new BABYLON.PBRMetallicRoughnessMaterial("mat", scene);
boxMaterial.metallic = 0;
boxMaterial.roughness = 1;

const box = BABYLON.MeshBuilder.CreateBox("box", { faceColors, size: 1 }, scene);
box.position.z = 5;
box.material = boxMaterial;

engine.registerView(document.getElementById("canvas1") as HTMLCanvasElement, babylonCamera);
engine.registerView(document.getElementById("canvas2") as HTMLCanvasElement, zapparCamera);

// Debug plane to ensure scene is right way up
const plane = BABYLON.Mesh.CreatePlane("plane", 2, scene);
plane.position.z = 4;
plane.position.y = 1;
const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
const button1 = GUI.Button.CreateSimpleButton("but1", "Some text");
button1.width = 0.4;
button1.height = 0.2;
button1.color = "white";
button1.fontSize = 50;
button1.background = "green";

advancedTexture.addControl(button1);

engine.runRenderLoop(() => {
  zapparCamera.updateFrame();
  if (scene.activeCamera) {
    scene.render();
  }
});

let alpha = 0;
scene.registerBeforeRender(() => {
  box.rotation.x = 10 + Math.cos(alpha) * 2;
  box.rotation.y += Math.cos(alpha) / 1000;
  alpha += 0.005;
});
