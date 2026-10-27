import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { CampControls } from "./CampControls";
import { BuddylandControls } from "./BuddylandControls";
import { moduleDefinitions } from "./moduleDefinitions";
import { billyRules, buddylandRules } from "@/data/rules/buddylandRules";
import { newPlayEvent, playStoryBeats } from "@/lib/play/events";
import { moduleItemBeats } from "@/lib/play/modules";
import {
  BILLY_POWERS,
  BILLY_FINALES,
  BUDDIES,
  BUDDYLAND_EVENTS,
  BUDDYLAND_ITEMS,
  BUDDYLAND_TERRORS,
} from "../../../supabase/functions/_shared/play/buddyland";
import { CAMP_ONGOING_EVENTS } from "../../../supabase/functions/_shared/play/camp";

afterEach(cleanup);
const start = () =>
  newPlayEvent({ kind: "start", round: 1, saved: 0, killed: 0 });
const props = {
  killer: "Hans",
  location: "Camp Happy Trails",
  finalGirl: "Laurie",
};

it("exposes every imported Billy/Buddyland card name and effect to Rulebook search", () => {
  for (const [rules, cards] of [
    [
      billyRules,
      [
        ...BILLY_POWERS,
        ...BILLY_FINALES,
        ...BUDDYLAND_TERRORS.filter((c) => "killer" in c),
      ],
    ],
    [
      buddylandRules,
      [
        ...BUDDYLAND_EVENTS,
        ...BUDDYLAND_ITEMS,
        ...BUDDYLAND_TERRORS.filter((c) => "location" in c),
      ],
    ],
  ] as const) {
    const text = JSON.stringify(rules.rules);
    for (const card of cards) {
      expect(text, card.name).toContain(card.name);
      expect(text, card.name).toContain(card.effect);
    }
  }
  for (const buddy of BUDDIES)
    expect(JSON.stringify(billyRules.rules)).toContain(buddy.name);
  expect(JSON.stringify(buddylandRules.rules)).not.toContain(
    "Merciless Minions",
  );
  expect(JSON.stringify(billyRules.rules)).not.toContain("Sing-A-Long");
});

it("keeps Camp ongoing picture toggles quiet while Secret Tunnel retains its disclosure", () => {
  const onEvent = vi.fn(() => true);
  const { container, rerender } = render(
    <CampControls
      {...props}
      part="location"
      events={[start()]}
      onEvent={onEvent}
    />,
  );
  const cards = [
    ...container.querySelectorAll('[data-module-control="event"]'),
  ];
  expect(cards).toHaveLength(6);
  for (const card of cards) {
    const name = card.querySelector("strong")!.textContent;
    const reference = CAMP_ONGOING_EVENTS.find((e) => e.name === name)!;
    const rules = card.querySelector(".module-card-rules");
    if (reference.id === "secret-tunnel") {
      expect(rules).toHaveTextContent(reference.effect);
      fireEvent.click(rules!.querySelector("summary")!);
    } else {
      expect(rules).toBeNull();
      expect(card.querySelectorAll("button")).toHaveLength(1);
    }
  }
  expect(onEvent).not.toHaveBeenCalled();
  const events = [
    start(),
    newPlayEvent({
      kind: "module",
      moduleData: {
        module: "camp",
        changes: { "event.clingy-campers": "active" },
      },
    }),
  ];
  rerender(
    <CampControls
      {...props}
      part="location"
      events={events}
      onEvent={onEvent}
    />,
  );
  expect(container.querySelector(".module-active-reminder")).toBeNull();
  rerender(
    <CampControls
      {...props}
      part="location"
      events={[
        ...events,
        newPlayEvent({
          kind: "module",
          moduleData: {
            module: "camp",
            changes: { "event.clingy-campers": "resolved" },
          },
        }),
      ]}
      onEvent={onEvent}
    />,
  );
  expect(container.querySelector(".module-active-reminder")).toBeNull();
  expect(onEvent).not.toHaveBeenCalled();
});

it("keeps special-victim cards free of Rules disclosures without mixing location effects", () => {
  const onEvent = vi.fn(() => true);
  const { container, unmount } = render(
    <CampControls
      {...props}
      part="location"
      events={[start()]}
      onEvent={onEvent}
    />,
  );
  const cards = [
    ...container.querySelectorAll('[data-module-control="character"]'),
  ];
  expect(cards).toHaveLength(3);
  for (const card of cards)
    expect(card.querySelector(".module-card-rules")).toBeNull();
  expect(container).not.toHaveTextContent("lose two Time");
  unmount();
  const venue = render(
    <BuddylandControls
      {...props}
      location="Buddyland"
      part="location"
      events={[start()]}
      onEvent={onEvent}
    />,
  );
  const nick = [
    ...venue.container.querySelectorAll('[data-module-control="character"]'),
  ].find((c) => c.querySelector("strong")!.textContent === "Nick the Janitor")!;
  expect(nick.querySelector(".module-card-rules")).toBeNull();
  expect(
    venue.container.querySelectorAll(
      '[data-module-control="character"] .module-card-rules',
    ),
  ).toHaveLength(0);
  expect(onEvent).not.toHaveBeenCalled();
});

it("distinguishes Billy unknown, partial and fully recorded rosters without inferring totals", () => {
  const summary = moduleDefinitions.find((m) => m.id === "billy")!.summary;
  expect(summary({})).toContain("Buddies not recorded");
  expect(summary({ "buddy.toby.status": "defeated" })).toContain(
    "0 Buddies in play (1/7 recorded)",
  );
  expect(summary({ "buddy.toby.status": "active" })).toContain(
    "1 Buddy in play (1/7 recorded)",
  );
  expect(
    summary(
      Object.fromEntries(
        BUDDIES.map((b) => [`buddy.${b.id}.status`, "defeated"]),
      ),
    ),
  ).toContain("0 Buddies in play (7/7 recorded)");
});

it("uses the selected location’s Energy Drink and never infers use or current inventory", () => {
  const found = newPlayEvent({
    kind: "moment",
    momentType: "item",
    detail: "Energy Drink",
    text: "Found Energy Drink",
  });
  for (const killer of ["Hans", "Billy the Bear", "Geppetto", "Dr. Fright"]) {
    const selection = { killer, location: "Buddyland" };
    const text = moduleItemBeats(selection, [found]);
    expect(text).toContain("5 Time");
    expect(text).toContain("up to 2 spaces");
    expect(text).toContain("does not establish use");
    expect(playStoryBeats([start(), found], selection)).toContain("5 Time");
  }
  for (const location of ["Camp Happy Trails", "Maple Lane"])
    expect(moduleItemBeats({ killer: "Hans", location }, [found])).toContain(
      "three Time",
    );
  expect(moduleItemBeats({ killer: "Hans", location: "Other" }, [found])).toBe(
    "",
  );
});
