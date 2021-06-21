/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import * as BABYLON from "babylonjs";
import { FaceAnchor, FaceMesh as ZapparFaceMesh } from "@zappar/zappar";
import { FaceTracker } from "../defaultpipeline";
import FaceAnchorTransformNode from "../trackers/faceAnchor";
import FaceMeshLoader from "../loaders/faceMesh";

let faceMeshSingleton: ZapparFaceMesh | undefined;

/**
 * A BABYLON.mesh which updates as the user's face and deforms as the user's expression changes.
 * @see https://docs.zap.works/universal-ar/web-libraries/babylonjs/face-tracking/
 */
class FaceMesh extends BABYLON.Mesh {
  public _faceMesh: ZapparFaceMesh;

  private vertexData: BABYLON.VertexData = new BABYLON.VertexData();

  /**
   * Constructs a new face mesh.
   * @param name - The name of the face mesh,
   * @param scene - A babylon scene.
   * @param onLoad - Callback function which runs when the mesh is loaded.
   * @param onError - Callback which is called if there's an error loading the mesh.
   */
  public constructor(name: string, scene: BABYLON.Scene, faceMesh?: ZapparFaceMesh) {
    super(name, scene);
    this._faceMesh = new ZapparFaceMesh();
    this.rotation.z = Math.PI;

    if (!faceMesh) {
      if (!faceMeshSingleton) {
        faceMeshSingleton = new FaceMeshLoader().load();
      }
      faceMesh = faceMeshSingleton;
    }
    this._faceMesh = faceMesh;
  }

  public update(): void {
    if (this._faceMesh.vertices.length === 0) return;
    const { normals, uvs, indices, vertices } = this._faceMesh;
    if (this.getScene().useRightHandedSystem) this.rotation.y = Math.PI;
    for (let i = 0; i < vertices.length; i += 1) {
      vertices[i] *= -1;
    }
    // TODO: More elegant solution of vertically inverting uvs
    if (this.material) {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in this.material) {
        if ((this as any).material[key] instanceof BABYLON.BaseTexture) {
          (this as any).material[key].vScale = -1;
        }
      }
    }

    this.vertexData.positions = vertices;
    this.vertexData.indices = indices;
    this.vertexData.normals = this.flipFaceNormals(normals);
    this.vertexData.uvs = uvs;

    this.vertexData.applyToMesh(this, this.isVertexBufferUpdatable(BABYLON.VertexBuffer.PositionKind));
  }

  public updateFromFaceTracker(faceTracker: FaceTracker): void {
    faceTracker.visible.forEach((anchor) => {
      this.updateFromFaceAnchor(anchor);
    });
  }

  public flipFaceNormals(meshNormals: Float32Array): Float32Array {
    for (let i = 0; i < meshNormals.length; ++i) {
      meshNormals[i * 3 + 2] *= -1;
    }
    return meshNormals;
  }

  public updateFromFaceAnchor(anchor: FaceAnchor): void {
    if (this._faceMesh.vertices.length === 0) return;
    this._faceMesh.updateFromFaceAnchor(anchor);
    this.update();
  }

  public updateFromFaceAnchorTransformNode(faceAnchorTransformNode: FaceAnchorTransformNode): void {
    if (!faceAnchorTransformNode.currentAnchor) return;
    this.updateFromFaceTracker(faceAnchorTransformNode.faceTracker);
  }
}

export default FaceMesh;
