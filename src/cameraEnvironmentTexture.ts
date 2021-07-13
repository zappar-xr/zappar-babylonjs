import * as BABYLON from "babylonjs";
import Camera from "./camera";

class CameraEnvironmentMap {
  private sphereTransformNode = new BABYLON.TransformNode("sp");

  private probe: BABYLON.ReflectionProbe;

  private material: BABYLON.StandardMaterial;

  /**
   * Constructs a new Camera Environment Map.
   * @param zapparCamera - The Zappar camera.
   * @param engine - The Babylon engine.
   * @param size - Defines the texture resolution (for each face)
   * @param refreshRate - Sets the refresh rate to use (`RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME` by default).
   */
  public constructor(
    private zapparCamera: Camera,
    engine: BABYLON.Engine,
    size: number = 256,
    refreshRate: number = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONEVERYFRAME
  ) {
    // Blank scene for the probe.
    const envScene = new BABYLON.Scene(engine);

    // Event handlers are not needed.
    envScene.detachControl();

    // All scenes must have a camera.
    const camera = new BABYLON.Camera("zapparEnv_camera", new BABYLON.Vector3(0, 0, 0), envScene);
    const material = new BABYLON.StandardMaterial("zapparEnv_mat", envScene);
    // Double side
    material.backFaceCulling = false;
    // Avoid having a light in the scene
    material.emissiveTexture = this.zapparCamera.backgroundTexture;
    this.material = material;

    this.probe = new BABYLON.ReflectionProbe("zapparEnv_probe", size, envScene);

    const sphere = BABYLON.MeshBuilder.CreateSphere("zapparEnv_sphere", { segments: 16, diameter: 10 }, envScene);

    const sphereTransformNode = new BABYLON.TransformNode("zapparEnv_sphereTransformNode");
    sphere.parent = sphereTransformNode;

    // Rotate the correct way around.
    sphere.rotation.set(BABYLON.Tools.ToRadians(180), BABYLON.Tools.ToRadians(-90), 0);

    sphere.material = material;
    this.probe?.renderList?.push(sphere);
    this.probe.attachToMesh(sphere);
    this.probe.refreshRate = refreshRate;
  }

  /**
   * @returns The resulting map texture. Set this as your `scene.environmentTexture` or as a material's `environmentTexture`.
   */
  public get cubeTexture(): BABYLON.BaseTexture {
    return this.probe.cubeTexture;
  }

  /**
   * Destroy the resources held by this object.
   */
  public dispose() {
    this.sphereTransformNode.dispose();
    this.probe.dispose();
  }

  /**
   * Update the contents of the environment map with the latest texture from the camera.
   *
   * Call this each frame after you call `update` on your Zappar camera, but before you render the scene.
   */
  public update() {
    this.material.markAsDirty(BABYLON.Material.TextureDirtyFlag);
    this.sphereTransformNode.rotation.copyFrom(this.zapparCamera.rotation);
  }
}

export default CameraEnvironmentMap;
