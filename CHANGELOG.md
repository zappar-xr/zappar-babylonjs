# Changelog

## [2.0.0] - 2022-08-23

### Added

- Greatly improved instant tracking.
- Introduced `SequenceSource` and pipeline functions to record and playback sequences of camera+motion data.
- Added support for curved tracking.
- Added support for fetching image element containing target image's embedded preview image.
- Improved GL state management.

### Changed

- Migrated to Webpack 5 workers.

### **Breaking:**

- Dropped support for webpack 4.

## [0.3.34] - 2022-04-21

### Fixed

- An issue where the camera `layer` would not get rendered if there are no loaded materials in the scene.

## [0.3.32 - 0.3.33] - 2022-04-05

### Fixed

- Camera `layer` for BabylonJS v5+.

## [0.3.31] - 2022-02-02

### Fixed

- External WebGL state is preserved during `process_gl` calls.

## [0.3.30] - 2022-01-24

- Updated dependencies.

## [0.3.29] - 2021-11-01

### Changed

- Pinned dependencies to exact versions

## [0.3.28] - 2021-07-29

### Fixed

- Some readme inconsistencies.

## [0.3.28] - 2021-07-05

### Fixed

- Some readme inconsistencies.

## [0.3.27] - 2021-07-05

### Added

- Realtime Camera-based environment map. This is exported as `CameraEnvironmentMap`.
- `Realtime Camera-based Reflections` section to `README.md`
- `CameraEnvironmentMap` tests.

## [0.3.26] - 2021-06-21

- Updated compatibility section in `README.md`

### Added

- `Links and Resources` section to `README.md`.

## [0.3.25] - 2021-06-21

### Added

- Preview gif to `README.md`.

## [0.3.24] - 2021-06-21

- Publish SDK to NPM & GitHub
