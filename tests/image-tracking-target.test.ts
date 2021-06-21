/* eslint-disable no-undef */
import * as util from "@zappar/test-utils";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(120000);
const testName = "image-tracking-target";

["generated-standalone", "module"].forEach((testType) => {
  const url = `https://0.0.0.0:8081/pages/jest/${testType}/${testName}.html`;

  describe(`${testType} ${testName}`, () => {
    it("console logs", async () => {
      const page = await browser.newPage();
      page.goto(url);
      await util.expectConsoleLogs(
        [
          /^Zappar for BabylonJS v/,
          /Zappar JS v\d*.\d*.\d*/,
          /Zappar CV v\d*.\d*.\d*/,
          /^Babylon.js v/,
          "[Zappar] INFO html_element_source_t initialized",
          "[Zappar] INFO camera_source_t initialized",
          "[Zappar] INFO pipeline_t initialized",
          "[Zappar] INFO identity for license check: 0.0.0.0",
          "[Zappar] INFO image_tracker_t initialized",
          "[Zappar] INFO loading target from memory: 236297 bytes",
          "[Zappar] INFO image target loaded",
          "Anchor is visible",
        ],
        page as any,
        60000,
        new Set([
          "[Zappar] INFO no display data",
          "[HMR] Waiting for update signal from WDS...",
          "[WDS] Hot Module Replacement enabled.",
          "[WDS] Live Reloading enabled.",
          "[Zappar] INFO image tracker camera model recalculation",
          "[WDS] App hot update...",
          "[HMR] Checking for updates on the server...",
        ])
      );

      const screenshot = await page.screenshot();
      expect(screenshot).toMatchImageSnapshot({
        customDiffConfig: {
          threshold: 0.02,
        },
        failureThreshold: 0.02,
        failureThresholdType: "percent",
      });
      // Avoid premature exit
      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.close();
    });
  });
});
