const POLL_MS = 2000;

async function tick() {
  try {
    await chrome.runtime.sendMessage({ type: "BRIDGE_POLL" });
  } catch {
    // The service worker may be asleep; the next tick will wake it.
  }
}

tick();
setInterval(tick, POLL_MS);
