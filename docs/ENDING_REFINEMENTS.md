# Ending reader and Stats boundary

The ending reader removes its Session options menu and keeps Save and Narrate. At desktop widths, the poster column uses only the width its intact portrait needs; the story takes the remaining space up to a readable 960-pixel copy column. Controls stay compact under the title. Phone and tablet reading keeps the existing single-column layout and normal page scroll.

New opening stories, endings, death scenes and poster title/tagline planning share quantity guidance. Recorded totals remain available and authoritative, but prose normally shows human consequences rather than reciting game counters. Exact numbers are appropriate when a character could know them and they matter to the scene. No numbers are stripped after generation, and saved stories and cached scenes are not rewritten.

The live Stats document extended over 500 pixels beyond its content. Absolutely positioned screen-reader labels in off-screen weapon rows were positioned relative to the page rather than their scroll container. Making bounded Stats lists positioned containers retains those accessible labels and contains their overflow. The outer document remains the only page scroller, and list-edge wheel handoff still works.

The regression fixture uses 56 distinct weapons. On the previous build it reproduced over 1,700 pixels of excess scroll. Coverage checks both ends of the list, desktop/phone/tablet widths, keyboard access and the legal text's position above the fixed footer. Ending coverage checks wider text, readable font sizes, footer clearance after resizing, and the removal of the menu. Prompt checks retain exact facts and death quantities while applying the prose guidance to every relevant generation route. Provider calls are mocked.

After merge, publish the frontend and redeploy `generate-story`, `generate-ending`, `generate-death-scene`, and `generate-scene-image`. No migration, new secret or model change is required. Review the style on the next newly generated story; this change does not claim a live-model output evaluation.
