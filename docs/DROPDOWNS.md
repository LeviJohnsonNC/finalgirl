# Product-wide dropdown behavior

Use `Select` from `@/components/ui/select` for fixed choices, or `PlaySelect` and `OutcomeSelect` in their respective forms. Use `PlaySearch` for search within a catalog and `SuggestionInput` for editable text with suggestions. Action menus use `DropdownMenu` or `ContextMenu` from `@/components/ui`. These components carry the app's styling into the popup. CI lint rejects native select and datalist controls and direct imports of the Radix menu primitives in app code.

The shared Select renderer alphabetizes displayed option labels, using an English, case-insensitive natural comparison. Empty and unknown choices sort by their visible labels too. Set `sortOptions={false}` on `SelectContent` when the order carries meaning, as with Birds rescue difficulty and the Special Rules jump menu. Rules chapters retain their reading order in the main index and previous/next navigation.

Play's searchable pickers use the same ordering before and after filtering. Clear selection and custom-entry choices participate in that order. Search is available, but browsing the full list does not require it. The popover owns its modal scroll lock so an enclosing death dialog cannot cancel its wheel events.

The mobile Rules chapter picker and outcome weapon/ending-location suggestions now use themed menus instead of native select/datalist popups. Outcome suggestions retain editable text, custom entries, keyboard arrows/Enter/Escape, and saved drafts. Opening an existing value shows the full catalog until the player types a filter.

All dropdown surfaces use the existing dark green, ivory and brass palette, bounded viewport-aware heights and real styled scrollbars. Radix's default Select scrollbar hiding is overridden. Explicit WebKit rail sizing keeps the scrollbar visible on macOS instead of relying on an auto-hiding thin native rail. The casting file picker also receives this scrollbar treatment. Long names wrap and option targets remain at least 44 pixels tall.

Browser verification covers alphabetical setup/event lists, browsing the last option without search, keyboard selection, wheel scrolling inside the death modal, filtered ordering, outcome free text and saved rooms, revealed killer identities, and the mobile Rules picker. Existing outcome/rules tests exercise persistence and navigation through the same controls.

This is a frontend-only release. No migration, secret, model change or edge-function deployment is required.
