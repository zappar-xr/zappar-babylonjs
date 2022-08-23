/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import * as BABYLON from "babylonjs";
import { ImageTarget } from "@zappar/zappar/lib/imagetracker";

/**
 * A BABYLON.mesh which  fits to the target image.
 * @see https://docs.zap.works/universal-ar/web-libraries/babylonjs/image-tracking/
 */
class TargetImagePreviewMesh extends BABYLON.Mesh {
  private vertexData: BABYLON.VertexData = new BABYLON.VertexData();

  /**
   * Constructs a new TargetImagePreviewMesh.
   * @param name - The name of the face mesh,
   * @param scene - A babylon scene.
   * @param imageTarget - The image target which will be used.
   */
  public constructor(name: string, scene: BABYLON.Scene, private imageTarget: ImageTarget) {
    super(name, scene);
    const material = new BABYLON.StandardMaterial("mat", scene);
    const texture = new BABYLON.Texture(this.imageTarget.image!.src, scene);
    material.emissiveTexture = texture;
    this.material = material;
    this.rotation.z = Math.PI;
    this.update();
  }

  /**
   * @ignore
   */
  private update(): void {
    if (this.imageTarget.preview.vertices.length === 0) return;
    const { uvs, indices, vertices } = this.imageTarget.preview;
    if (this.getScene().useRightHandedSystem) this.rotation.y = Math.PI;
    for (let i = 0; i < vertices.length; i += 1) {
      vertices[i] *= -1;
    }

    this.vertexData.positions = vertices;
    this.vertexData.indices = indices;
    this.vertexData.uvs = uvs;

    this.vertexData.applyToMesh(this, this.isVertexBufferUpdatable(BABYLON.VertexBuffer.PositionKind));
  }
}

export default TargetImagePreviewMesh;
