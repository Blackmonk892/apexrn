export const PRESET_KEY = "apexrn-preset";

// Runs in <head> before first paint so the preset never flashes.
export const PRESET_SCRIPT = `try{var p=localStorage.getItem("${PRESET_KEY}");document.documentElement.dataset.preset=p==="raw"?"raw":"neo"}catch(e){document.documentElement.dataset.preset="neo"}`;
