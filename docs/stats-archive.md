# The recovered-footage archive

Stats uses a moonlit lakeside cabin environment, four photographic totals, a scenic glass win/loss meter, an activity panel, eight case highlights, and a compact evidence log beside the player profile. Titles, counts, chart marks, and percentages are rendered by the app; the new artwork contains no baked-in interface text or data.

## Artwork and geometry

Six optimized WebP assets in `src/assets/stats/` provide the environment, neutral forest footage, and four contact-print backgrounds. Local Fell and Caveat fonts give headings and handwritten notes their archival character. Decorative notes and prints disappear on phones.

The two footage layers each occupy the whole meter. Cyan and red grading share identical image dimensions and positions; clipping alone changes with the exact win rate. The even marker stays at 50%. At 0% and 100%, the opposing segment is genuinely absent, the readout stays inside the glass, and no artificial boundary is drawn. No bubble animation or percentage-dependent image stretching remains.

The chart keeps honest stacked bars, its existing windows and views, tooltips, and the equivalent accessible table. Desktop plotting leaves room for the lakeside image; phone plotting uses the full available width. The chart paints its final values immediately.

## Bounded sections and behavior

- Final Girls, Killers, and Locations have one keyboard-focusable scroll region with sticky column headings. Small archives shrink naturally; large archives remain bounded.
- The weapon tally includes every recorded weapon, retaining the existing ranking and counts. Its list scrolls after the visible rows. The latest eight sessions remain available in a bounded list, and each row opens its exact saved case.
- Your Style shows a career archetype (or a blend when two readings are close) with its supporting facts. The expanded methodology gives all four dimensions and their individual coverage. Recent findings show up to three patterns with a direct link to an example case and an expandable list of supporting cases and beats.
- The basic record is visible from the first completed game. Sparse highlights use compact locked cards. Missing rounds and horror remain unrecorded rather than becoming zeroes. Entirely unrecorded victim totals show an em dash; the activity panel explains missing victim data and flags partial coverage without changing any calculations.
- Existing navigation actions move above the archive. The ticker is suppressed only while Stats is mounted; other pages keep their existing layout. The full fan-app attribution remains below Stats in every state.

## Play evidence

Stats separately reads the Play logs for up to 40 known game IDs from the owner’s archive. The first 20 form the recent window and the next 20 are reserved for comparisons. This uses the existing history row policy and leaves the compact summary request unchanged. The report is derived in memory from effective Play observations. Setup alone does not count toward coverage. Missing tracker readings, unknown round numbers and reviewed ending values cannot fill gaps in a timeline.

A rescue signature needs four games with timed rescues and a reveal, plus a direction seen in at least three games and 60% of the sample. An observed 1 HP report needs at least three drops. When rescue timing is sparse, four round-tracked wins can supply a median pace. Horror change compares paired wins with recorded recoveries and identical killers, locations and Final Girls. It requires at least four pairs, a mean difference of one level, and agreement in at least three quarters of the pairs. The career pressure dimension uses comparable ending Horror readings from the same cast and breaks the sequence at a missing reading.

## Review

Browser review covers desktop and phone layouts, 320–1440px widths, a fictional 56-session archive, 56 distinct long names, one-session 0%/100% records, failed images, missing values, sign-in/empty/error states, keyboard controls, table scrolling, and exact-case navigation. All external/provider traffic is mocked in browser tests.

The final desktop and phone images in `docs/images/` are actual browser captures using the shared fictional archive in `tests/browser/stats-data.ts` (56 sessions, 30 wins, 26 losses, 200 saved, 299 killed).

Run `npm run check`, `npm run build`, `npm run check:assets`, and `npm run test:browser`. The focused browser coverage is `tests/browser/stats.spec.ts`.
