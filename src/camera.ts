/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
import * as Zappar from "@zappar/zappar";
import * as BABYLON from "babylonjs";
import { InstantWorldAnchor } from "@zappar/zappar/lib/instantworldtracker";
import { getDefaultPipeline, CameraSource } from "./defaultpipeline";

/**
 * The pose modes that may be used for the camera to move around in the scene.
 */
export enum CameraPoseMode {
  /**
   * Camera sits, stationary, at the origin of world space, and points down the negative Z axis.
   * In this mode, tracked anchors move in world space as the user moves the device or tracked objects in the real world.
   */
  Default,

  /**
   * Camera sits at the origin of world space, but rotates as the user rotates the physical device.
   *
   * When the Zappar library initializes, the negative Z axis of world space points forward in front of the user.
   *
   * In this mode, tracked anchors move in world space as the user moves the device or tracked objects in the real world.
   */
  Attitude,

  /**
   * In this case the camera moves and rotates in world space around the anchor at the origin.
   */
  AnchorOrigin,
}

/**
 * The mirror modes that may be used.
 */
export enum CameraMirrorMode {
  /**
   * No mirroring.
   */
  None,

  /**
   * This mode mirrors the background camera texture and ensures content still appears correctly tracked.
   * In this mode your content itself isn't flipped, so any text in your tracked content doesn't appear mirrored.
   * This is the default mode for the user-facing camera.
   */
  Poses,

  /**
   * In this mode, the Zappar camera applies a scaleX(-1) CSS transform to your whole canvas.
   * This way both the camera and your content appear mirrored.
   */
  CSS,
}
/**
 * The source of frames.
 */
type Source = HTMLImageElement | HTMLVideoElement | string;

/**
 * Rear and user camera source options.
 * @property rearCameraSource? - The camera source which will be used for the rear camera.
 * @property userCameraSource? - The camera source which will be used for the user camera.
 */
type SourceOptions = {
  rearCameraSource?: Source;
  userCameraSource?: Source;
};

/**
 * Options to modify the camera behaviour.
 * @param pipeline - The pipeline that this tracker will operate within.
 * @property pipeline? - The pipeline that this tracker will operate within.
 * @property zNear? - The near clipping plane.
 * @property zFar? - The far clipping plane..
 */
type Options =
  | Zappar.Pipeline
  | (Partial<{
      pipeline: Zappar.Pipeline;
      zNear: number;
      zFar: number;
    }> &
      SourceOptions);

/**
 * Creates a camera that you can use instead of a Babylon.js camera.
 *
 *
 * The ZapparBabylon library needs to use your WebGL context in order to process camera frames.
 * You can set it when your page loads using {@link glContextSet}.
 * @see https://docs.zap.works/universal-ar/web-libraries/babylonjs/camera-setup/
 */
class Camera extends BABYLON.FreeCamera {
  public pipeline: Zappar.Pipeline;

  /**
   * The pose mode that is used for the camera to move around in the scene.
   */
  public poseMode = CameraPoseMode.Default;

  /**
   * The transformation with the (camera-relative) origin specified by the anchor.
   */
  public poseAnchorOrigin: Zappar.ImageAnchor | Zappar.FaceAnchor | InstantWorldAnchor | undefined;

  /**
   * The mirror mode that is used for the rear camera.
   */
  public rearCameraMirrorMode: CameraMirrorMode = CameraMirrorMode.None;

  /**
   * The mirror mode that is used for the user camera.
   */
  public userCameraMirrorMode: CameraMirrorMode = CameraMirrorMode.Poses;

  private _currentMirrorMode: CameraMirrorMode = CameraMirrorMode.None;

  /**
   * A 4x4 column-major transformation matrix where the camera sits.
   */
  public rawPose: Float32Array;

  /**
   * The camera source which is be used for the rear camera.
   */
  public rearCameraSource: CameraSource | Zappar.HTMLElementSource;

  /**
   * The camera source which is be used for the user camera.
   */
  public userCameraSource: CameraSource | Zappar.HTMLElementSource;

  /**
   * The camera feed texture.
   */
  public backgroundTexture: BABYLON.Texture;

  /**
   * The layer onto which the background texture is rendered.
   */
  public layer: BABYLON.Layer;

  private _engine: BABYLON.Engine;

  private _gl: WebGLRenderingContext;

  private _cameraRunningRear: boolean | null = null;

  private _hasSetCSSScaleX = false;

  private updateInternally: boolean | undefined;

  private zFar: number | undefined;

  private zNear: number | undefined;

  /**
   * Constructs a new Camera.
   * @param name - The name of the camera.
   * @param scene - A Babylon scene.
   * @param pipeline - The pipeline that this tracker will operate within.
   * @property pipeline - The pipeline that this tracker will operate within.
   * @property zNear - The near clipping plane.
   * @property zFar - The far clipping plane.
   * @property rearCameraSource? - The camera source which will be used for the rear camera.
   * @property userCameraSource? - The camera source which will be used for the user camera.
   */
  public constructor(name: string, scene: BABYLON.Scene, opts?: Options) {
    super(name, new BABYLON.Vector3(0, 0, 0), scene);

    this._engine = scene.getEngine();
    this._gl = this._engine._gl;

    // Shortest blank img uri
    this.backgroundTexture = new BABYLON.Texture("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", scene);

    this.layer = new BABYLON.Layer("zapparCameraBackgroundLayer", null, scene);
    this.layer.texture = this.backgroundTexture;
    this.layer.isBackground = true;

    this.pipeline = opts instanceof Zappar.Pipeline ? opts : opts?.pipeline || getDefaultPipeline();
    this.pipeline.glContextSet(this._gl);
    this.rawPose = this.pipeline.cameraPoseDefault();

    if (opts && !(opts instanceof Zappar.Pipeline)) {
      this.zNear = opts.zNear ? opts.zNear : 0.1;
      this.zFar = opts.zFar ? opts.zFar : 100;

      this.rearCameraSource = this._cameraSourceFromOpts(opts.rearCameraSource);
      this.userCameraSource = this._cameraSourceFromOpts(opts.userCameraSource, true);
    } else {
      this.rearCameraSource = new CameraSource(Zappar.cameraDefaultDeviceID(), this.pipeline);
      this.userCameraSource = new CameraSource(Zappar.cameraDefaultDeviceID(true), this.pipeline);
    }

    document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible" ? this._resume() : this._pause();
    });
  }

  private _cameraSourceFromOpts(cameraSource?: Source, frontFacing = false): CameraSource | Zappar.HTMLElementSource {
    return cameraSource instanceof Element
      ? new Zappar.HTMLElementSource(this.pipeline, cameraSource)
      : new CameraSource(cameraSource || Zappar.cameraDefaultDeviceID(frontFacing), this.pipeline);
  }

  private _pause(): void {
    this.userCameraSource.pause();
    this.rearCameraSource.pause();
  }

  /**
   * Starts the camera source.
   *
   * Starting a given source pauses any other sources within the same pipeline.
   */
  private _resume(): void {
    if (this._cameraRunningRear === null) return;
    this._cameraRunningRear ? this.rearCameraSource.start() : this.userCameraSource.start();
  }

  /**
   * Starts the camera source.
   * @param userFacing - If true, starts the user facing camera. (i.e selfie).
   */
  public start(userFacing?: boolean): void {
    userFacing ? this.userCameraSource.start() : this.rearCameraSource.start();
    this._cameraRunningRear = !userFacing;
  }

  /**
   * Sets the pose mode to 'Anchor Origin'.
   *
   * In this case the camera moves and rotates in world space around the anchor at the origin.
   * @param anchor - Image anchor or face anchor.
   */
  public setPoseModeAnchorOrigin(a: Zappar.ImageAnchor | Zappar.FaceAnchor): void {
    this.poseAnchorOrigin = a;
    this.poseMode = CameraPoseMode.AnchorOrigin;
  }

  /**
   * Gets current mirror mode.
   */
  public get currentMirrorMode(): CameraMirrorMode {
    return this._currentMirrorMode;
  }

  private _updateLayerTexture(): void {
    this.pipeline.processGL();
    this.pipeline.cameraFrameUploadGL();
    this.pipeline.frameUpdate();

    const webglTexture = this.pipeline.cameraFrameTextureGL();
    if (webglTexture === undefined) return;

    if ((this as any).layer.texture?._texture?._hardwareTexture) {
      (this as any).layer.texture?._texture?._hardwareTexture?.set(webglTexture);
    } else {
      (this as any).layer.texture._texture._webGLTexture = webglTexture;
    }
    const view = this.pipeline.cameraFrameTextureMatrix(
      this._engine.getRenderWidth(),
      this._engine.getRenderHeight(),
      this._currentMirrorMode === CameraMirrorMode.Poses
    );

    const zapparViewMatrix = BABYLON.Matrix.FromArray(view);

    (zapparViewMatrix as any).m[8] = view[12];
    (zapparViewMatrix as any).m[9] = view[13];

    this.layer.texture?.getTextureMatrix().copyFrom(zapparViewMatrix);
  }

  private _getOriginPose(): Float32Array {
    if (!this.poseAnchorOrigin) return this.pipeline.cameraPoseDefault();
    return this.pipeline.cameraPoseWithOrigin(this.poseAnchorOrigin.poseCameraRelative(this._currentMirrorMode === CameraMirrorMode.Poses));
  }

  /**
   * Destroys the camera sources.
   */
  public dispose(): void {
    this.rearCameraSource.destroy();
    this.userCameraSource.destroy();
  }

  /**
   * Processes camera frames and updates `backgroundTexture`.
   * Call this function on your pipeline once an animation frame (e.g. during your `requestAnimationFrame` function).
   */
  public updateFrame(): void {
    this._updateLayerTexture();

    this._currentMirrorMode = this.pipeline.cameraFrameUserFacing() ? this.userCameraMirrorMode : this.rearCameraMirrorMode;

    if (this._currentMirrorMode !== CameraMirrorMode.CSS && this._hasSetCSSScaleX) {
      (this._gl.canvas as HTMLCanvasElement).style.transform = "";
      this._hasSetCSSScaleX = false;
    } else if (this._currentMirrorMode === CameraMirrorMode.CSS && !this._hasSetCSSScaleX) {
      (this._gl.canvas as HTMLCanvasElement).style.transform = "scaleX(-1)";
      this._hasSetCSSScaleX = true;
    }

    this.updateProjectionMatrix();

    switch (this.poseMode) {
      case CameraPoseMode.Default:
        this.rawPose = this.pipeline.cameraPoseDefault();
        break;
      case CameraPoseMode.Attitude:
        this.rawPose = this.pipeline.cameraPoseWithAttitude(this._currentMirrorMode === CameraMirrorMode.Poses);
        break;
      case CameraPoseMode.AnchorOrigin:
        this.rawPose = this.poseAnchorOrigin ? this._getOriginPose() : this.pipeline.cameraPoseDefault();
        break;
      default:
        this.rawPose = this.pipeline.cameraPoseDefault();
        break;
    }

    const sourceMatrix = BABYLON.Matrix.FromArray(this.rawPose);
    if (!this.getScene().useRightHandedSystem) sourceMatrix.toggleModelMatrixHandInPlace();
    const rotMatrix: BABYLON.Matrix = sourceMatrix.getRotationMatrix();
    const rotation: BABYLON.Quaternion = new BABYLON.Quaternion().fromRotationMatrix(rotMatrix);
    const pos = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 0), sourceMatrix);
    this.rotation.copyFrom(rotation.toEulerAngles());
    this.position.copyFrom(pos);
  }

  /**
   * Updates the projection matrix.
   */
  public updateProjectionMatrix(): void {
    const model = this.pipeline.cameraModel();
    const projection = Zappar.projectionMatrixFromCameraModel(model, this._engine.getRenderWidth(), this._engine.getRenderHeight(), this.zNear, this.zFar);
    if (this.getScene().useRightHandedSystem) projection[0] *= -1;

    const projectionMatrix = BABYLON.Matrix.FromArray(projection);
    projectionMatrix.toggleProjectionMatrixHandInPlace();
    this._projectionMatrix.copyFrom(projectionMatrix);
  }

  /**
   * @returns - the projection matrix.
   */
  public getProjectionMatrix(): BABYLON.Matrix {
    if (this.updateInternally) {
      this.updateFrame();
    }
    return this._projectionMatrix;
  }
}

export default Camera;
