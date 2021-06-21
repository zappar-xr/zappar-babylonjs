/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-named-default */
/* eslint-disable no-unused-vars */
import * as BABYLON from "babylonjs";
import { InstantWorldTracker } from "@zappar/zappar";
import { InstantWorldTrackerTransformOrigin } from "@zappar/zappar/lib/instantworldtracker";
import { default as Camera, CameraMirrorMode } from "../camera";

/**
 * A BABYLON.TransformNode which attaches content to a point on a surface in front of the user as it moves around in the camera view.
 * @see https://docs.zap.works/universal-ar/web-libraries/threejs/instant-world-tracking/
 */
class InstantWorldAnchorTransformNode extends BABYLON.TransformNode {
  private readonly observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.Scene>>;

  /**
   * Constructs a new InstantWorldAnchorTransformNode.
   * @param name - The name of the transform node.
   * @param camera - A ZapparBabylon.Camera.
   * @param instantTracker - The instant world tracker which will be used.
   * @param scene - A babylonjs scene.
   */
  public constructor(name: string, private _camera: Camera, public readonly instantTracker: InstantWorldTracker, scene: BABYLON.Scene) {
    super(name, scene);
    const engine = this.getEngine();
    this.observer = scene.onBeforeRenderObservable.add(this.update);
  }

  private update = (): void => {
    const sourcePose = this.instantTracker.anchor.pose(this._camera.rawPose, this._camera.currentMirrorMode === CameraMirrorMode.Poses);
    const sourceMatrix = BABYLON.Matrix.FromArray(sourcePose);
    if (!this.getScene().useRightHandedSystem) sourceMatrix.toggleModelMatrixHandInPlace();
    const rotation: BABYLON.Quaternion = new BABYLON.Quaternion();
    sourceMatrix.decompose(this.scaling, rotation, this.position);
    this.rotation.copyFrom(rotation.toEulerAngles());
    this.freezeWorldMatrix(sourceMatrix);
  };

  /**
   * Sets the point in the user's environment that the anchor tracks from.
   *
   * The parameters passed in to this function correspond to the X, Y and Z coordinates (in camera space) of the point to track.
   * Choosing a position with X and Y coordinates of zero, and a negative Z coordinate,
   * will select a point on a surface directly in front of the center of the screen.
   *
   * @param orientation -  The orientation of the point in space.
   */
  public setAnchorPoseFromCameraOffset(x: number, y: number, z: number, orientation?: InstantWorldTrackerTransformOrigin): void {
    this.instantTracker.setAnchorPoseFromCameraOffset(x, y, z, orientation);
  }

  /**
   * Removes the observer.
   */
  public dispose(): void {
    this._scene.onBeforeRenderObservable.remove(this.observer);
  }
}

export default InstantWorldAnchorTransformNode;
