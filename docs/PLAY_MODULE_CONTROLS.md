# Illustrated Play modules

Each supported killer and location registers independently in `src/components/play/ModuleControls.tsx`. A definition supplies its owner, exact selection match, banner, factual summary and controls. The host renders Killer before Location; a mixed selection never attaches the other half of a film.

`ModulePanel` supplies the illustrated disclosure and retains mounted children while collapsed. Its preference is stored locally by account, game and module, outside the gameplay snapshot and cloud queue. Toggling a section never records an observation. Billy's existing one-time source initialization remains in the killer controls and preserves previously recorded values.

`IllustratedTile` and `ModuleArtwork` provide shared visual controls. Generated atlas cells are rendered through SVG view boxes, preserving the original artwork without stretching subjects. Static WebP assets require no generation calls during play. Labels and states remain live HTML. Button artwork never contains interactive child controls.

Billy retains the existing portraits, cycle order and source controls, including the fifth source. Legacy Saved/Away victim observations retain their accurate labels and are not rewritten on load. Camp and Hans use the same frame with their existing observations and controls. Main totals, remembered reveals and death-time snapshots keep their current authority.

The generated Billy/Buddyland banner atlas contains two 1536×512 panoramas: workshop above, venue below. It follows the existing mechanical bear identity and photographic VHS palette. Original role/state assets remain in their existing folders.

Validation covers all four supported combinations, independent expansion, keyboard opening, preference recovery, passive expansion, legacy records, source initialization, Undo, death/ending context, 320px phone layout and desktop layout. Existing CI runs frontend, edge, database and both browser projects; this UI change requires no schema or edge-function deployment.
