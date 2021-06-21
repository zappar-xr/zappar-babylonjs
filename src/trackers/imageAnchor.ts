/* eslint-disable import/no-named-default */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import * as BABYLON from "babylonjs";
import { ImageTracker, ImageAnchor } from "@zappar/zappar";
import { default as Camera, CameraMirrorMode } from "../camera";

/**
 * A BABYLON.TransformNode which attaches content to a known image as it moves around in the camera view.
 * @see https://docs.zap.works/universal-ar/web-libraries/babylonjs/image-tracking/
 */
class ImageAnchorTransformNode extends BABYLON.TransformNode {
  /**
   * A point in 3D space (including orientation) in a fixed location relative to a tracked object or environment.
   */
  public currentAnchor: ImageAnchor | undefined;

  private readonly observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.Scene>>;

  /**
   * Constructs a new ImageAnchorGroup.
   * @param name - The name of the transform node.
   * @param camera - A ZapparBabylon.Camera.
   * @param imageTracker - The image tracker which will be used.
   * @param anchorId - The anchorId which will define the current anchor.
   * @param scene - A babylonjs scene.
   */
  public constructor(name: string, private _camera: Camera, public readonly imageTracker: ImageTracker, scene: BABYLON.Scene, public anchorId?: string) {
    super(name, scene);
    const engine = this.getEngine();
    this.observer = scene.onBeforeRenderObservable.add(this.update);
  }

  private update = (): void => {
    if (!this.currentAnchor || !this.imageTracker.visible.has(this.currentAnchor)) {
      // No current anchor, or current anchor isn't visible
      if (this.anchorId) {
        this.currentAnchor = this.imageTracker.anchors.get(this.anchorId);
      } else {
        this.currentAnchor = this.imageTracker.visible.values().next().value;
      }
    }
    if (this.currentAnchor) {
      const sourcePose = this.currentAnchor.pose(this._camera.rawPose, this._camera.currentMirrorMode === CameraMirrorMode.Poses);
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

export default ImageAnchorTransformNode;
