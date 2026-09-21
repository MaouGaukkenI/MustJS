# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses Semantic Versioning.

## [0.0.3] - 2026-09-21

### Added

- New script templates for recipes and content manipulation:
  - `Applied.js`, with functions for Applied Energistics 2 recipes.
  - `ExtraCreate.js`, with additional utilities for Create recipes.
  - `Minecraft.js`, with functions for vanilla recipes and item tags.
  - `Remove.js`, with functions for removing and replacing recipes.
- Individual configuration options to generate each new script.

### Changed

- Script synchronization now handles each file independently, preventing a failure in one script from interrupting the others.

## [0.0.2] - 2026-09-11

### Added

- Released version `0.0.2` of the mod.

### Fixed

- Corrected the inverted order of the base and held items in the deploying recipe function.

## [0.0.1]

### Added

- Initial MustJS library structure.
- Support for creating Create recipes through reusable KubeJS functions.
- `CreateBaseFunctions` for common Create processing recipes.
- Support for:
  - Compacting
  - Crushing
  - Cutting
  - Deploying
  - Emptying
  - Filling
  - Haunting
  - Item Application
  - Mechanical Crafting
  - Milling
  - Mixing
  - Pressing
  - Polishing
  - Splashing
  - Sequenced Assembly
- Auxiliary functions for Sequenced Assembly:
  - `cuttingS()`
  - `deployingS()`
  - `fillingS()`
  - `pressingS()`
- `FluidManipulator` utilities:
  - `fluidInput()`
  - `fluidOutput()`
- `ItemManipulator` utilities:
  - `itemInput()`
  - `itemInputTag()`
  - `itemInputKey()`
  - `itemInputTagKey()`
  - `itemOutput()`
  - `itemOutputStack()`
  - `itemOutputChance()`
  - `itemOutputChanceStack()`

### Documentation

- Initial README documentation.
- Instructions for using MustJS as a KubeJS library.
- Function reference and usage examples.
- Documentation for Create recipe generation.
- Documentation for item and fluid manipulation.
- Project requirements.

## Credits

MustJS is developed and maintained by **MaouGaukken**.

If you use, modify, or redistribute MustJS, please provide appropriate credit to the original project and its author.
