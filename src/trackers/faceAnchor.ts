/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import { FaceTracker, FaceAnchor } from "@zappar/zappar";
import * as BABYLON from "babylonjs";
import { Camera } from "../index";
import { CameraMirrorMode } from "../camera";

/**
 * A BABYLON.TransformNode which attaches content to a face as it moves around in the camera view.
 * @see https://docs.zap.works/universal-ar/web-libraries/babylonjs/face-tracking/
 */
class FaceAnchorTransformNode extends BABYLON.TransformNode {
  /**
   * A point in 3D space (including orientation) in a fixed location relative to a tracked object or environment.
   */
  public currentAnchor: FaceAnchor | undefined;

  private readonly observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.Scene>>;

  /**
   * Constructs a new FaceAnchorGroup.
   * @param name - The name of the transform node.
   * @param camera - A ZapparBabylon.Camera.
   * @param faceTracker - The face tracker which will be used.
   * @param scene - A babylon scene.
   * @param anchorId - The anchorId which will define the current anchor.
   */
  public constructor(name: string, private _camera: Camera, public readonly faceTracker: FaceTracker, scene: BABYLON.Scene, public anchorId?: string) {
    super(name, scene);
    this.observer = scene.onBeforeRenderObservable.add(this.update);
  }

  private update = (): void => {
    if (!this.currentAnchor || !this.faceTracker.visible.has(this.currentAnchor)) {
      // No current anchor, or current anchor isn't visible
      if (this.anchorId) {
        this.currentAnchor = this.faceTracker.anchors.get(this.anchorId);
      } else {
        this.currentAnchor = this.faceTracker.visible.values().next().value;
      }
    }
    if (this.currentAnchor) {
      const sourcePose = this.currentAnchor.pose(this._camera.rawPose, this._camera.currentMirrorMode === CameraMirrorMode.Poses); // todo: Last arg could be a method in camera
      const sourceMatrix = BABYLON.Matrix.FromArray(sourcePose);
      if (!this.getScene().useRightHandedSystem) sourceMatrix.toggleModelMatrixHandInPlace();
      const rotation: BABYLON.Quaternion = new BABYLON.Quaternion();
      sourceMatrix.decompose(this.scaling, rotation, this.position);
      this.rotation.copyFrom(rotation.toEulerAngles());
      this.freezeWorldMatrix(sourceMatrix);
    }
  };

  /**
   * Removes the observer.
   */
  public dispose(): void {
    this._scene.onBeforeRenderObservable.remove(this.observer);
  }
}

export default FaceAnchorTransformNode;
