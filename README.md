# Zappar for BabylonJS

This library allows you use Zappar's best-in-class AR technology with content built using the 3D rendering platform BabylonJS.

It provides high performance (30 frames-per-second) face, image and world tracking, in the browsers already installed on your users' mobile phones.

<img src="preview/preview.gif" width="450"/>

You may also be interested in:

- [Zappar for A-Frame](https://www.npmjs.com/package/@zappar/zappar-aframe) (@zappar/zappar-aframe)
- [Zappar for ThreeJS](https://www.npmjs.com/package/@zappar/zappar-threejs) (@zappar/zappar-threejs)
- [Zappar for React Three Fiber](https://www.npmjs.com/package/@zappar/zappar-react-three-fiber) (@zappar/zappar-react-three-fiber)
- Zappar's library for Unity
- [Zappar for JavaScript](https://www.npmjs.com/package/@zappar/zappar) (@zappar/zappar), if you'd like to build content with a different 3D rendering platform
- ZapWorks Studio, a full 3D development environment built for AR, VR and MR

## Table Of Contents

<details>
<summary>Click to expand table of contents</summary>

<!--ts-->
   * [Zappar for BabylonJS](#zappar-for-babylonjs)
      * [Table Of Contents](#table-of-contents)
      * [Getting Started](#getting-started)
         * [Bootstrap Projects](#bootstrap-projects)
         * [Example Projects](#example-projects)
      * [Starting Development](#starting-development)
         * [Standalone Download](#standalone-download)
         * [CDN](#cdn)
         * [NPM Webpack Package](#npm-webpack-package)
      * [Overview](#overview)
      * [Local Preview and Testing](#local-preview-and-testing)
      * [Compatibility and Browser Support](#compatibility-and-browser-support)
         * [Detecting Browser Compatibility](#detecting-browser-compatibility)
      * [Hosting and Publishing Content](#hosting-and-publishing-content)
         * [Licensing](#licensing)
      * [Camera Processing](#camera-processing)
         * [Constructing the Camera](#constructing-the-camera)
         * [Options](#options)
            * [Custom Video Devices](#custom-video-devices)
            * [Clipping Planes](#clipping-planes)
         * [Processing Camera Frames](#processing-camera-frames)
         * [Permissions](#permissions)
         * [Starting the Camera](#starting-the-camera)
         * [Camera Pose](#camera-pose)
      * [Tracking](#tracking)
         * [Image Tracking](#image-tracking)
            * [Target File](#target-file)
            * [Image Anchors](#image-anchors)
            * [Events](#events)
         * [Face Tracking](#face-tracking)
            * [Model File](#model-file)
            * [Face Anchors](#face-anchors)
            * [Events](#events-1)
         * [Face Landmarks](#face-landmarks)
         * [Face Mesh](#face-mesh)
         * [Head Masking](#head-masking)
         * [Instant World Tracking](#instant-world-tracking)
      * [Links and Resources](#links-and-resources)

<!-- Added by: zapparadmin, at: Mon Jun 21 15:17:28 BST 2021 -->

<!--te-->
</details>

## Getting Started

### Bootstrap Projects

You can get started super-quickly using one of our bootstrap projects. They contain the basics of an AR experience for the different tracking types - no more, no less.

The JavaScript repositories, contain `index.html` files to get you started. Alternatively, TypeScript repositories, contain `webpack` setups optimized for development and deployment.

 Tracking Type | JavaScript | TypeScript
--- | --- | ---
Image Tracking   | [GitHub url](https://github.com/zappar-xr/zappar-babylonjs-image-tracking-standalone-bootstrap)   | [GitHub url](https://github.com/zappar-xr/zappar-babylonjs-image-tracking-webpack-bootstrap)
Face Tracking    | [GitHub url](https://github.com/zappar-xr/zappar-babylonjs-face-tracking-standalone-bootstrap)    | [GitHub url](https://github.com/zappar-xr/zappar-babylonjs-face-tracking-webpack-bootstrap)
Instant Tracking | [GitHub url](https://github.com/zappar-xr/zappar-babylonjs-instant-tracking-standalone-bootstrap) | [GitHub url](https://github.com/zappar-xr/zappar-babylonjs-instant-tracking-webpack-bootstrap)

### Example Projects

There's a repository of example projects for your delectation over [here](https://github.com/zappar-xr/zappar-babylonjs-examples)

## Starting Development

You can use this library by downloading a standalone zip containing the necessary files, by linking to our CDN, or by installing from NPM for use in a webpack project.

### Standalone Download

Unzip into your web project and reference from your HTML like this:

```html
<script src="zappar-babylon.js"></script>
```

### CDN

Reference the zappar.js library from your HTML like this:

```html
<script src="https://libs.zappar.com/zappar-babylon/0.3.26/zappar-babylon.js"></script>
```

### NPM Webpack Package

Run the following NPM command inside your project directory:

```bash
npm install --save @zappar/zappar-babylonjs
```

Then import the library into your JavaScript or TypeScript files:

```ts
import * as ZapparBabylon from "@zappar/zappar-babylonjs";
```

The final step is to add this necessary entry to your webpack `rules`:

```ts
module.exports = {
  //...
  module: {
    rules: [
      //...
      {
        test: /zcv\.wasm$/,
        type: "javascript/auto",
        loader: "file-loader"
      }
      //...
    ]
  }
};
```

## Overview

You can integrate the Zappar library with the existing `runRenderLoop` loop of your BabylonJS project. A typical project may look like this. The remainder of this document goes into more detail about each of the component elements of this example.

```ts
import * as BABYLON from 'babylonjs';
// Import path to the target file ( Made using @zappar/zapworks-cli )
import targetfile from './assets/example-tracking-image.zpt';
import * as ZapparBabylon from '@zappar/zappar-babylonjs';

// Setup BabylonJS in the usual way.
const canvasHolder = document.querySelector('#canvas-holder') || document.createElement('div');
const canvas = document.createElement('canvas');
canvasHolder.appendChild(canvas);

const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
const scene = new BABYLON.Scene(engine);
const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

// Create a Zappar AR camera
const camera = new ZapparBabylon.Camera('camera', scene);

// Request camera permissions and start the camera
ZapparBabylon.permissionRequestUI().then((granted) => {
    if (granted) camera.start();
    else ZapparBabylon.permissionDeniedUI();
});

// Set up a tracker, in this case an image tracker
const imageTracker = new ZapparBabylon.ImageTrackerLoader().load(targetfile);
const trackerTransformNode = new ZapparBabylon.ImageAnchorTransformNode('tracker', camera, imageTracker, scene);

// Child any 3D content you'd like tracked from the image into the trackerTransformNode
const box = BABYLON.Mesh.CreateBox('box', 1, scene, false);
box.parent = trackerTransformNode;



engine.runRenderLoop(() => {
  camera.updateFrame();
  scene.render();
});

```

## Local Preview and Testing

Due to browser restrictions surrounding use of the camera, you must use HTTPS to view or preview your site, even if doing so locally from your computer. If you're using `webpack`, consider using `webpack-dev-server` which has an `https` option to enable this.

Alternatively you can use the [ZapWorks command-line tool](https://www.npmjs.com/package/@zappar/zapworks-cli) to serve a folder over HTTPS for access on your local computer, like this:

```bash
zapworks serve .
```

The command also lets you serve the folder for access by other devices on your local network, like this:

```bash
zapworks serve . --lan
```

## Compatibility and Browser Support

This library works well on the browsers that enjoy the vast majority of mobile market-share. That said, there are a number of web browsers available across the mobile and desktop device landscape.

*Best support:*

- Safari for iOS (version 11.3 and later)
- Chrome for Android (versions from at least the last year)

*Functional but not our primary support target (support quality):*

- Most Webkit/Blink-based web browsers for Android, including Brave (good)
- Most third-party web browsers for iOS from iOS 14.3 and later (good)
- iOS in-app web views implemented with SFSafariViewController (good)
- iOS in-app web views implemented with WKWebView from iOS 14.3 (good)
- Firefox for Android (good, however performance may be lower than other browsers)
- Chrome for Mac/Windows (*)
- Firefox for Mac/Windows (*)
- Safari for Mac (*)

*Known to not work:*

- iOS in-app web views implemented with WKWebView prior to iOS 14.3 - this iOS technology do not support camera access at all and thus we’re unable to support it. Apple has rectified this issue in iOS 14.3.
- iOS in-app web views implemented with the deprecated UIWebView component - this iOS technology do not support camera access at all and thus we’re unable to support it.
- Non-Safari web browsers on iOS, including Chrome, Firefox and Brave, before iOS 14.3 - these browsers use WKWebView due to App Store restrictions and thus do not support camera access.

\* Browsers without motion sensor access (e.g desktop browsers) don't support instant world tracking or attitude-based camera poses.

### Detecting Browser Compatibility

To make it easy to detect if your page is running in a browser that's not supported, we've provided the `browserIncompatible()` and `browserIncompatibleUI()` functions:

```ts
if (ZapparBabylon.browserIncompatible()) {
    ZapparBabylon.browserIncompatibleUI();
    throw new Error("Unsupported browser");
}
```

The `browserIncompatibleUI()` function shows a full-page dialog that informs the user they're using an unsupported browser, and provides a button to 'copy' the current page URL so they can 'paste' it into the address bar of a compatible alternative.

## Hosting and Publishing Content

Once you've built your site, you have a number of options for hosting your site:

- Using ZapWork's integrated hosting
- Self-hosting on servers and a domain that you manage

Head over to the [ZapWorks Publishing and Hosting article](https://docs.zap.works/universal-ar/publishing-and-hosting/) to learn more about these options.

### Licensing

This wrapper library is MIT licensed, but relies on our proprietary computer vision library, `@zappar/zappar-cv`, for which you must maintain an activate subscription at ZapWorks. To learn more about licensing, [click here](https://docs.zap.works/universal-ar/licensing/).

The source code for this wrapper library is available freely for your viewing pleasure over at GitHub:
<https://github.com/zappar-xr/zappar-babylonjs/>

## Camera Processing

### Constructing the Camera

The library provides a camera object that you can use instead of Babylon's Camera. It's constructed like this:

```ts
const camera = new ZapparBabylon.Camera('camera', scene);
```

### Options

Options may be passed into the `ZapparBabylon.Camera` constructor.

#### Custom Video Devices

```ts
const camera = new ZapparBabylon.Camera(
    "camera",
    scene,
    {
        rearCameraSource:'csO9c0YpAf274OuCPUA53CNE0YHlIr2yXCi+SqfBZZ8=',
        userCameraSource: 'RKxXByjnabbADGQNNZqLVLdmXlS0YkETYCIbg+XxnvM='
    }
);
```

#### Clipping Planes

```ts
const camera = new ZapparBabylon.Camera(
    "camera",
    scene,
    { // These values are defaults.
        zNear: 0.1,
        zFar: 100
    }
);
```

### Processing Camera Frames

Call the following function once an animation frame (e.g. during your `engine.runRenderLoop` function) in order to process incoming camera frames:

```ts
camera.updateFrame();
```

Alternatively, you may allow the camera to update itself (no longer requiring the step above) by constructing it as so:

```ts
const camera = new ZapparBabylon.Camera('camera', scene, true); // Self updating camera
```

### Permissions

The library needs to ask the user for permission to access the camera and motion sensors on the device.

To do this, you can use the following function to show a built-in UI informing the user of the need and providing a button to trigger the browser's permission prompts. The function returns a promise that lets you know if the user granted the permissions or not.

```ts
// Show Zappar's built-in UI to request camera permissions
ZapparBabylon.permissionRequestUI().then(granted => {
    if (granted) {
        // User granted the permissions so start the camera
        camera.start();
    } else {
        // User denied the permissions so show Zappar's built-in 'permission denied' UI
        ZapparBabylon.permissionDeniedUI();
    }
});
```

If you'd rather show your own permissions UI, you can use the following function to trigger the browser's permission prompts directly. The function returns a promise that resolves to `true` if the user granted all the necessary permissions, otherwise `false`. Please note - due to browser restrictions, this function must be called from within a user event, e.g. in the event handler of a button click.

```ts
ZapparBabylon.permissionRequest().then(granted => {
    if (granted) {
        // User granted the permissions so start the camera
    } else {
        // User denied the permissions
        // You can show your own 'permission denied' UI here or use Zappar's built-in one
        ZapparBabylon.permissionDeniedUI();
    }
});
```

### Starting the Camera

Once the user has granted the necessary permissions, you can start the rear-facing camera on the device with the following function on your camera object:

```ts
camera.start();
```

If you'd like to start the user-facing 'selfie' camera, pass `true`:

```ts
camera.start(true);
```

To switch between the front- and rear-facing cameras during your experience, just call `camera.start(...)` again passing either `true` or `false` as appropriate.

User-facing cameras are normally shown mirrored to users and so the camera object provides a number of modes to support this:

- `ZapparBabylon.CameraMirrorMode.Poses`: this mode mirrors the background camera texture and ensures content still appears correctly tracked. In this mode your content itself isn't flipped, so any text in your tracked content doesn't appear mirrored. This is the default mode for the user-facing camera.
- `ZapparBabylon.CameraMirrorMode.CSS`: in this mode, the Zappar camera applies a `scaleX(-1)` CSS transform to your whole canvas. This way both the camera and your content appear mirrored.
- `ZapparBabylon.CameraMirrorMode.None`: no mirroring is performed. This is the default mode for the rear-facing camera.

 The `userCameraMirrorMode` and `rearCameraMirrorMode` parameters set which mode the camera object will use for each camera:

 ```ts
camera.userCameraMirrorMode = ZapparBabylon.CameraMirrorMode.CSS;
 ```

### Camera Pose

The Zappar library provides multiple modes for the camera to move around in the BabylonJS scene. You can set this mode with the `poseMode` parameter of your camera object. There are the following options:

- `ZapparBabylon.CameraPoseMode.Default`: in this mode the camera stays at the origin of the scene, pointing down the negative Z axis. Any tracked anchors will move around in your scene as the user moves the physical camera and real-world tracked objects.
- `ZapparBabylon.CameraPoseMode.Attitude`: the camera stays at the origin of the scene, but rotates as the user rotates the physical device. When the Zappar library initializes, the negative Z axis of world space points forward in front of the user.
- `ZapparBabylon.CameraPoseMode.AnchorOrigin`: the origin of the scene is the center of the anchor specified by the camera's `poseAnchorOrigin` parameter. In this case the camera moves and rotates in world space around the anchor at the origin.

 The correct choice of camera pose will depend on your given use case and content. Here are some examples you might like to consider when choosing which is best for you:

- To have a light that always shines down from above the user, regardless of the angle of the device or anchors, use `ZapparBabylon.CameraPoseMode.Attitude` and place a light shining down the negative Y axis is world space.
- In an application with a physics simulation of stacked blocks, and with gravity pointing down the negative Y axis of world space, using `ZapparBabylon.CameraPoseMode.AnchorOrigin` would allow the blocks to rest on a tracked image regardless of how the image is held by the user, while using `ZapparBabylon.CameraPoseMode.Attitude` would allow the user to tip the blocks off the image by tilting it.

## Tracking

The Zappar library offers three types of tracking for you to use to build augmented reality experiences:

- *Image Tracking* can detect and track a flat image in 3D space. This is great for building content that's augmented onto business cards, posters, magazine pages, etc.
- *Face Tracking* detects and tracks the user's face. You can attach 3D objects to the face itself, or render a 3D mesh that's fit to (and deforms with) the face as the user moves and changes their expression. You could build face-filter experiences to allow users to try on different virtual sunglasses, for example, or to simulate face paint.
- *Instant World Tracking* lets you tracking 3D content to a point chosen by the user in the room or immediate environment around them. With this tracking type you could build a 3D model viewer that lets users walk around to view the model from different angles, or an experience that places an animated character in their room.

### Image Tracking

To track content from a flat image in the camera view, create a new `ImageTracker` object:

```ts
const imageTracker = new ZapparBabylon.ImageTracker();
```

#### Target File

`ImageTracker`s use a special 'target file' that's been generated from the source image you'd like to track. You can generate them using the ZapWorks command-line utility like this:

```bash
zapworks train myImage.png
```

The resulting file can be loaded into an image tracker object by passing it to the `loadTarget(...)` function as either a URL or an ArrayBuffer. The function returns a promise that resolves when the target file has been loaded successfully.

```ts
const imageTracker = new ZapparBabylon.ImageTracker();
imageTracker.loadTarget("myImage.zpt").then(() => {
    // Image target has been loaded
});
```

Alternatively the library provides a loader for loading a tracker and target file:

```ts
const imageTracker = new ZapparBabylon.ImageTrackerLoader().load("myImage.zpt");
```

#### Image Anchors

Each `ImageTracker` exposes anchors for images detected and tracked in the camera view. At this time, `ImageTracker`s only track one image in view at a time.

Anchors have the following parameters:

- `id`: a string that's unique for this anchor
- `visible`: a boolean indicating if this anchor is visible in the current camera frame
- `onVisible` and `onNotVisible`: event handlers that emit when the anchor becomes visible, or disappears in the camera view. These events are emitted during your call to `camera.updateFrame()`.

You can access the anchors of a tracker using its `anchors` parameter - it's a JavaScript `Map` keyed with the IDs of the anchors. Trackers will reuse existing non-visible anchors for new images that appear and thus, until `ImageTracker` supports tracking more than one image at a time, there is never more than one anchor managed by each `ImageTracker`. Each tracker also exposes a JavaScript `Set` of anchors visible in the current camera frame as its `visible` parameter.

To attach 3D content (e.g. BabylonJS objects or models) to an `ImageTracker` or an `ImageAnchor`, the library provides `ImageAnchorTransformNode`. It's a BabylonJS TransformNode that will follow the supplied anchor (or, in the case of a supplied `ImageTracker`, the anchor most recently visible in that tracker) in the 3D view:

```ts
const imageAnchorTransformNode = new ZapparBabylon.ImageAnchorTransformNode('tracker', camera, imageTracker, scene);

// Add in any 3D objects you'd like to track to this image
myModel.parent = imageAnchorTransformNode;
```

The TransformNode provides a coordinate system that has its origin at the center of the image, with positive X axis to the right, the positive Y axis towards the top and the positive Z axis coming up out of the plane of the image. The scale of the coordinate system is such that a Y value of +1 corresponds to the top of the image, and a Y value of -1 corresponds to the bottom of the image. The X axis positions of the left and right edges of the target image therefore depend on the aspect ratio of the image.

#### Events

In addition to using the `anchors` and `visible` parameters, `ImageTracker`s expose event handlers that you can use to be notified of changes in the anchors or their visibility.  The events are emitted during your call to `camera.updateFrame()`.

- `onNewAnchor` - emitted when a new anchor is created by the tracker
- `onVisible` - emitted when an anchor becomes visible in a camera frame
- `onNotVisible` - emitted when an anchor goes from being visible in the previous camera frame, to being not visible in the current frame

Here's an example of using these events:

```ts
imageTracker.onNewAnchor.bind(anchor => {
    console.log("New anchor has appeared:", anchor.id);
    // You may like to create a new ImageAnchorTransformNode here for this anchor, and add it to your scene
});

imageTracker.onVisible.bind(anchor => {
    console.log("Anchor is visible:", anchor.id);
});

imageTracker.onNotVisible.bind(anchor => {
    console.log("Anchor is not visible:", anchor.id);
});
```

### Face Tracking

To place content on or around a user's face, create a new `FaceTracker` object when your page loads:

```ts
const faceTracker = new ZapparBabylon.FaceTracker();
```

#### Model File

The face tracking algorithm requires a model file of data in order to operate - you can call `loadDefaultModel()` to load the one that's included by default with the library. The function returns a promise that resolves when the model has been loaded successfully.

```ts
const faceTracker = new ZapparBabylon.FaceTracker();
faceTracker.loadDefaultModel().then(() => {
    // The model has been loaded successfully
});
```

Alternatively the library provides a loader for loading a tracker and model file:

```ts
const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
```

#### Face Anchors

Each `FaceTracker` exposes anchors for faces detected and tracked in the camera view. By default a maximum of one face is tracked at a time, however you can change this using the `maxFaces` parameter:

```ts
faceTracker.maxFaces = 2;
```

Note that setting a value of two or more may impact the performance and framerate of the library, so we recommend sticking with one unless your use case requires tracking multiple faces.

Anchors have the following parameters:

- `id`: a string that's unique for this anchor
- `visible`: a boolean indicating if this anchor is visible in the current camera frame
- `identity` and `expression`: `Float32Array`s containing data used for rendering a face-fitting mesh (see below)
- `onVisible` and `onNotVisible`: event handlers that emit when the anchor becomes visible, or disappears in the camera view. These events are emitted during your call to `camera.updateFrame()`

You can access the anchors of a tracker using its `anchors` parameter - it's a JavaScript `Map` keyed with the IDs of the anchors. Trackers will reuse existing non-visible anchors for new faces that appear and thus there are never more than `maxFaces` anchors handled by a given tracker. Each tracker also exposes a JavaScript `Set` of anchors visible in the current camera frame as its `visible` parameter.

To attach 3D content (e.g. BabylonJS objects or models) to a `FaceTracker` or a `FaceAnchor`, the library provides `FaceAnchorTransformNode`. It's a BabylonJS TransformNode that will follow the supplied anchor (or, in the case of a supplied `FaceTracker`, the anchor most recently visible in that tracker) in the 3D view:

```ts
const faceAnchorTransformNode = new ZapparBabylon.FaceAnchorTransformNode('tracker', camera, faceTracker, scene);

// Child any 3D objects you'd like to track to this face
myModel.parent = faceAnchorTransformNode;
```

The TransformNode provides a coordinate system that has its origin at the center of the head, with positive X axis to the right, the positive Y axis towards the top and the positive Z axis coming forward out of the user's head.

Note that users typically expect to see a mirrored view of any user-facing camera feed. Please see the section on mirroring the camera view earlier in this document.

#### Events

In addition to using the `anchors` and `visible` parameters, `FaceTracker`s expose event handlers that you can use to be notified of changes in the anchors or their visibility. The events are emitted during your call to `camera.updateFrame(renderer)`.

- `onNewAnchor` - emitted when a new anchor is created by the tracker
- `onVisible` - emitted when an anchor becomes visible in a camera frame
- `onNotVisible` - emitted when an anchor goes from being visible in the previous camera frame, to being not visible in the current frame

Here's an example of using these events:

```ts
faceTracker.onNewAnchor.bind(anchor => {
    console.log("New anchor has appeared:", anchor.id);

    // You may like to create a new FaceAnchorTransformNode here for this anchor, and add it to your scene
});

faceTracker.onVisible.bind(anchor => {
    console.log("Anchor is visible:", anchor.id);
});

faceTracker.onNotVisible.bind(anchor => {
    console.log("Anchor is not visible:", anchor.id);
});
```

### Face Landmarks

In addition to tracking the center of the head, you can use `FaceLandmarkTransformNode` to track content from various points on the user's face. These landmarks will remain accurate, even as the user's expression changes.

To track a landmark, construct a new `FaceLandmarkTransformNode` object, passing your camera, face tracker, and the name of the landmark you'd like to track:

```ts
const faceLandmarkTransformNode = new ZapparBabylon.FaceLandmarkTransformNode('tracker', camera, faceTracker, ZapparBabylon.FaceLandmarkName.CHIN, scene);

// Child any 3D objects you'd like to track to this face
myModel.parent = faceLandmarkTransformNode;
```

The following landmarks are available: `EYE_LEFT`, `EYE_RIGHT`, `EAR_LEFT`, `EAR_RIGHT`, `NOSE_BRIDGE`, `NOSE_TIP`, `NOSE_BASE`, `LIP_TOP`, `LIP_BOTTOM`, `MOUTH_CENTER`, `CHIN`, `EYEBROW_LEFT`, and `EYEBROW_RIGHT`. Note that 'left' and 'right' here are from the user's perspective.

### Face Mesh

In addition to tracking the center of the face using `FaceTracker`, the Zappar library provides a number of meshes that will fit to the face/head and deform as the user's expression changes. These can be used to apply a texture to the user's skin, much like face paint, or to mask out the back of 3D models so the user's head is not occluded where it shouldn't be.

To use the face mesh, first construct a new `FaceMesh` object and load its data file. The `loadDefaultFace` function returns a promise that resolves when the data file has been loaded successfully. You may wish to use to show a 'loading' screen to the user while this is taking place.

```ts
const faceMesh = new ZapparBabylon.FaceMesh();
faceMesh.loadDefaultFace().then(() => {
    // Face mesh loaded
});
```

Alternatively the library provides a loader for loading face mesh and data file:

```ts
const faceMesh = new ZapparBabylon.FaceMeshLoader().loadFace();
```

While the `faceMesh` object lets you access the raw vertex, UV, normal and indices data for the face mesh, you may wish to use the library's `FaceMeshGeometry` object which wraps the data as a BabylonJS Mesh. This Mesh object must still be childed to a `FaceAnchorTransformNode` to appear in the correct place on-screen:

```ts
const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode('tracker', camera, faceTracker, scene);

const material = new BABYLON.StandardMaterial('mat', scene);
material.diffuseTexture = new BABYLON.Texture(faceMeshTexture, scene);

const faceMesh = new ZapparBabylon.FaceMeshGeometry('face mesh', scene);
faceMesh.parent = trackerTransformNode;
faceMesh.material = material;

targetPlane.parent = trackerTransformNode;


```

Each frame, after `camera.updateFrame()`, call one of the following functions to update the face mesh to the most recent identity and expression output from a face anchor:

```ts
// Update directly from a FaceAnchorTransformNode
faceMesh.updateFromFaceAnchorTransformNode(faceAnchorTransformNode);

// Update from a face anchor
faceMesh.updateFromFaceAnchor(myFaceAnchor);
```

At this time there are two meshes included with the library. The default mesh covers the user's face, from the chin at the bottom to the forehead, and from the sideburns on each side. There are optional parameters that determine if the mouth and eyes are filled or not:

```ts
loadDefaultFace(fillMouth?: boolean, fillEyeLeft?: boolean, fillEyeRight?: boolean)
```

The full head simplified mesh covers the whole of the user's head, including some neck. It's ideal for drawing into the depth buffer in order to mask out the back of 3D models placed on the user's head (see Head Masking below). There are optional parameters that determine if the mouth, eyes and neck are filled or not:

```ts
loadDefaultFullHeadSimplified(fillMouth?: boolean, fillEyeLeft?: boolean, fillEyeRight?: boolean, fillNeck?: boolean)
```

### Head Masking

If you're placing a 3D model around the user's head, such as a helmet, it's important to make sure the camera view of the user's real face is not hidden by the back of the model. To achieve this, the library provides `ZapparBabylon.HeadMaskMesh`. It's a `BABYLON.Mesh` that fits the user's head and fills the depth buffer, ensuring that the camera image shows instead of any 3D elements behind it in the scene.

To use it, construct the object using a `ZapparBabylon.HeadMaskMeshLoader` and add it to your face anchor TransformNode:

```ts
const mask = new ZapparBabylon.HeadMaskMeshLoader('mask mesh').load();
faceAnchorTransformNode.add(mask);
```

Then, in each frame after `camera.updateFrame()`, call one of the following functions to update the head mesh to the most recent identity and expression output from a face anchor:

```ts
// Update directly from a FaceAnchorTransformNode
mask.updateFromFaceAnchorTransformNode(faceAnchorTransformNode);

// Update from a face anchor
mask.updateFromFaceAnchor(myFaceAnchor);
```

Behind the scenes the `HeadMaskMesh` works using a full-head `ZapparBabylon.FaceMesh` with the mouth, eyes and neck filled in. Its `material.disableColorWrite` is set to `true` so it fills the depth buffer but not the color buffer.

### Instant World Tracking

To track content from a point on a surface in front of the user, create a new `InstantWorldTracker`:

```ts
const instantWorldTracker = new ZapparBabylon.InstantWorldTracker();
```

Each `InstantWorldTracker` exposes a single anchor from its `anchor` parameter.

To choose the point in the user's environment that the anchor tracks from, use the `setAnchorPoseFromCameraOffset(...)` function, like this:

```ts
instantWorldTracker.setAnchorPoseFromCameraOffset(0, 0, -5);
```

The parameters passed in to this function correspond to the X, Y and Z coordinates (in camera space) of the point to track. Choosing a position with X and Y coordinates of zero, and a negative Z coordinate, will select a point on a surface directly in front of the center of the screen.

To attach 3D content (e.g. BabylonJS objects or models) to an `InstantWorldTracker`, the library provides `InstantWorldAnchorTransformNode`. It's a BabylonJS TransformNode that will follow the anchor in the supplied `InstantWorldTracker` in the 3D view:

```ts
const trackerTransformNode = new ZapparBabylon.InstantWorldAnchorTransformNode('tracker', camera, instantWorldTracker, scene);
// Child in any 3D objects you'd like to track to this point in space
myModel.parent = trackerTransformNode;
```

The TransformNode provides a coordinate system that has its origin at the point that's been set, with the positive Y coordinate pointing up out of the surface, and the X and Z coordinates in the plane of the surface. How far the chosen point is from the camera (i.e. how negative the Z coordinate provided to `setAnchorPoseFromCameraOffset` is) determines the scale of the coordinate system exposed by the anchor.

A typical application will call `setAnchorPoseFromCameraOffset` each frame until the user confirms their choice of placement by tapping a button, like this:

```ts
// Not shown - initialization, camera setup & permissions

const instantWorldTracker = new ZapparBabylon.InstantWorldTracker();
const instantWorldAnchorTransformNode = new ZapparBabylon.InstantWorldAnchorTransformNode('tracker', camera, instantWorldTracker, scene);

// Not shown - add content to the instantWorldAnchorTransformNode

let hasPlaced = false;

myConfirmButton.addEventListener("click", () => { hasPlaced = true });

engine.runRenderLoop(() => {
  camera.updateFrame();
  if (!hasPlaced) {
    instantWorldTracker.setAnchorPoseFromCameraOffset(0, 0, -5);
  }
  scene.render();
});

```

## Links and Resources

- [Web site](https://zap.works/universal-ar/)
- [Documentation](https://docs.zap.works/universal-ar/web-libraries/babylonjs/)
- [API Reference](<https://zappar-xr.github.io/zappar-babylonjs/>)
- [Forum](https://forum.zap.works/)
- [Issue tracker](https://github.com/zappar-xr/zappar-babylonjs/issues)
- [Source code](https://github.com/zappar-xr/zappar-babylonjs)
