# ToDo

## Hologram Low Power Mode

Add a user-controlled low power mode for the hologram animation.

### Goal

Allow users to explicitly enable a lower-cost hologram animation mode from `Settings.tsx`, without relying on automatic device/browser heuristics.

### Implementation Plan

- [ ] Add `hologramLowPowerMode` state in `magic-ui/src/App.tsx`.
- [ ] Persist the preference with `localStorage`.
- [ ] Pass `hologramLowPowerMode` and `setHologramLowPowerMode` into `magic-ui/src/components/Settings.tsx`.
- [ ] Add a settings switch labeled something like `Hologram Low Power Mode`.
- [ ] Pass `hologramLowPowerMode` from `App.tsx` into `magic-ui/src/components/chatbot/hologram/HologramModal.tsx`.
- [ ] Extend `HologramModalProps` in `magic-ui/src/components/chatbot/hologram/types.ts`.
- [ ] Pass `hologramLowPowerMode` into `useHologramAnimation`.
- [ ] In `useHologramAnimation.ts`, use low-power mode to reduce SVG wave cost:
  - Normal mode: current wave path update behavior.
  - Low-power mode: update wave paths at ~30fps / every other frame.
  - Low-power mode: increase wave point step from `3` to around `6`.
- [ ] Keep orb placement, compass-facing orientation, audio scale response, rings, and state transitions unchanged.
- [ ] Run `cd magic-ui && npm run build` to verify TypeScript/build.

### Notes

Current performance observations:

- Safari Paint/Composite appears very low, under `0.02ms`.
- Average CPU while hologram is open was observed around `13.6%`, medium zone.
- CPU drops under `1%` after closing the hologram, so cleanup appears healthy.
- The likely remaining optimization target is SVG wave path generation/mutation in `renderWaveLoop()`.
