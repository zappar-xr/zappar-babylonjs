/* eslint-disable no-undef */
import * as util from "@zappar/jest-console-logs";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(120000);
const testName = "face-tracking-face-mesh";

["generated-standalone", "module"].forEach((testType) => {
  const url = `https://0.0.0.0:8081/pages/jest/${testType}/${testName}.html`;

  describe(`${testType} ${testName}`, () => {
    it("console logs", async () => {
      const page = await browser.newPage();
      page.goto(url, { timeout: 0 });
      await util.expectLogs({
        expected: [
          /^Zappar for BabylonJS v/,
          /Zappar JS v\d*.\d*.\d*/,
          /Zappar CV v\d*.\d*.\d*/,
          /^Babylon.js v/,
          "[Zappar] INFO html_element_source_t initialized",
          "[Zappar] INFO camera_source_t initialized",
          "[Zappar] INFO face_mesh_t initialized",
          "[Zappar] INFO face_mesh_t initialized",
          "[Zappar] INFO pipeline_t initialized",
          "[Zappar] INFO identity for license check: 0.0.0.0",
          "[Zappar] INFO face_tracker_t initialized",
          "Anchor is visible",
        ],
        page,
        timeoutMs: 60000,
      });

      const screenshot = await page.screenshot();
      expect(screenshot).toMatchImageSnapshot({
        customDiffConfig: {
          threshold: 0.03,
        },
        failureThreshold: 0.03,
        failureThresholdType: "percent",
      });
      // Avoid premature exit
      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.close();
    });
  });
});
