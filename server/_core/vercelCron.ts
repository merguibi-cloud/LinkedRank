import { isAuthorizedCronRequest } from "../lib/cronAuth";
import {
  runAutoPublishPrefill,
  runAutoPublishTick,
} from "../workers/autoPublishWorker";

export { isAuthorizedCronRequest };

export async function runAutoPublishCron(): Promise<{ prefill: boolean }> {
  await runAutoPublishTick();
  const minute = new Date().getUTCMinutes();
  const prefill = minute % 5 === 0;
  if (prefill) {
    await runAutoPublishPrefill();
  }
  return { prefill };
}
