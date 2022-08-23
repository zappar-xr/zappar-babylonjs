/* eslint-disable no-undef */
import * as util from "@zappar/jest-console-logs";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });
jest.setTimeout(120000);
const testName = "instant-tracking";

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
          "[Zappar] INFO pipeline_t initialized",
          "[Zappar] INFO sequence_source_source_t initialized",
          "[Zappar] INFO instant_world_tracker_t initialized",
          "[Zappar] INFO Instant tracker camera model recalculation",
          "sequence finished",
        ],
        page,
        timeoutMs: 60000,
      });

      const divergence = await page.evaluate(() => {
        return Number(document.getElementById("divergence")!.innerHTML);
      });
      // check if div id "divergence" value is greather than 12
      expect(divergence).toBeLessThan(12);

      // Avoid premature exit
      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.close();
    });
  });
});
