/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import { FaceTracker, FaceAnchor, FaceLandmarkName, FaceLandmark } from "@zappar/zappar";
import * as BABYLON from "babylonjs";
import { mat4 } from "gl-matrix";
import { Camera } from "../index";
import { CameraMirrorMode } from "../camera";

/**
 * A BABYLON.TransformNode which attaches content to a known point (landmark) on a face as it moves around in the camera view.
 * Landmarks will remain accurate, even as the user's expression changes.
 * @see https://docs.zap.works/universal-ar/web-libraries/babylonjs/face-tracking/
 */
class FaceLandmarkTransformNode extends BABYLON.TransformNode {
  public currentAnchor: FaceAnchor | undefined;

  public landmark: FaceLandmark;

  private _pose = mat4.create();

  private readonly observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.Scene>>;

  /**
   * Constructs a new FaceLandmarkGroup.
   * @param name - The name of the transform node.
   * @param camera - A ZapparBabylon.Camera.
   * @param faceTracker - The face tracker which will be used.
   * @param landmark - The landmark to which the group will be anchored.
   * @param scene - A babylonjs scene.
   */
  public constructor(name: string, private _camera: Camera, public readonly faceTracker: FaceTracker, landmark: FaceLandmarkName, scene: BABYLON.Scene) {
    super(name, scene);
    const engine = this.getEngine();
    this.landmark = new FaceLandmark(landmark);
    this.observer = scene.onBeforeRenderObservable.add(this.update);
  }

  // TODO: migrate this into computeWorldMatrix
  private update = (): void => {
    if (!this.currentAnchor || !this.faceTracker.visible.has(this.currentAnchor)) {
      // No current anchor, or current anchor isn't visible
      this.currentAnchor = this.faceTracker.visible.values().next().value;
    }
    if (this.currentAnchor) {
      this.landmark.updateFromFaceAnchor(this.currentAnchor, this._camera.currentMirrorMode === CameraMirrorMode.Poses);
      mat4.multiply(
        this._pose,
        this.currentAnchor.pose(this._camera.rawPose, this._camera.currentMirrorMode === CameraMirrorMode.Poses) as mat4,
        this.landmark.pose as mat4
      );

      const sourceMatrix = BABYLON.Matrix.FromArray(this._pose);
      if (!this.getScene().useRightHandedSystem) sourceMatrix.toggleModelMatrixHandInPlace();
      const rotation: BABYLON.Quaternion = new BABYLON.Quaternion();
      sourceMatrix.decompose(this.scaling, rotation, this.position);
      this.rotation.copyFrom(rotation.toEulerAngles());
      this.freezeWorldMatrix(sourceMatrix);
    }
  };

  /**
   * Destroys the face landmark.
   */
  public dispose(): void {
    this.landmark.destroy();
    this._scene.onBeforeRenderObservable.remove(this.observer);
  }
}

export default FaceLandmarkTransformNode;
