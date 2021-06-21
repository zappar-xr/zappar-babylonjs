/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-empty-function */
import * as BABYLON from "babylonjs";
import HeadMaskMesh from "../mesh/headmask";

/**
 * Head mask mesh loader.
 * @see https://docs.zap.works/universal-ar/web-libraries/babylonjs/face-tracking/
 */
export class HeadMaskMeshLoader {
  /**
   * Constructs a new HeadMaskMeshLoader.
   * @param name - The name of the mesh.
   * @param scene - A scene.
   */
  public constructor(private name: string, public scene: BABYLON.Scene) {}

  /**
   * Loads a HeadMaskMesh.
   * @param onLoad - Callback which returns the HeadMaskMesh once it's loaded.
   * @param onError - Callback which is called if there's an error loading the mesh.
   * @returns The HeadMaskMesh.
   */
  public load(onLoad?: () => void, onError?: () => void): HeadMaskMesh {
    return new HeadMaskMesh(this.name, this.scene, onLoad, onError);
  }
}
export default HeadMaskMeshLoader;
