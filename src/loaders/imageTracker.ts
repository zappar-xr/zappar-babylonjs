/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
import { ImageTracker } from "../defaultpipeline";

/**
 * Image tracker loader.
 * @see https://docs.zap.works/universal-ar/web-libraries/babylonjs/image-tracking/
 */
export class ImageTrackerLoader {
  /**
   * Loads an image tracker.
   * @param zpt - A URL to, or ArrayBuffer of, an image target file.
   * @param onLoad - Callback which returns the imageTracker once it's loaded.
   * @param onError - Callback which is called if there's an error loading the target file.
   * @returns The ImageTracker.
   * @see https://docs.zap.works/universal-ar/zapworks-cli/
   */
  public load(zpt: string, onLoad?: (i: ImageTracker) => void, onError?: (message?: unknown) => void): ImageTracker {
    const trk = new ImageTracker();

    trk
      .loadTarget(zpt)
      .then(() => {
        onLoad?.(trk);
      })
      .catch((_) => {
        onError?.(_);
      });

    return trk;
  }
}

export default ImageTrackerLoader;
