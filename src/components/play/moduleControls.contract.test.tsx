import {
  cleanup,
  fireEvent,
  render,
  screen,
  renderHook,
  act,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { newPlayEvent } from "@/lib/play/events";
import { moduleDefinitions } from "./moduleDefinitions";
import { illustratedKillerCards } from "./killerPresentation";
import { CharacterControl } from "./CharacterControl";
import { EventControl } from "./EventControl";
import { MinorPowerControl } from "./MinorPowerControl";
import { useModuleRecord } from "./useModuleRecord";
import { FrightControls } from "./FrightControls";
import { initialFright } from "../../../supabase/functions/_shared/play/fright";

afterEach(cleanup);
const art = { src: "/test-art.webp" };

describe("registered modules use their declared shared interactions", () => {
  for (const module of moduleDefinitions)
    it(`${module.id}: declared capabilities exist without recording on mount`, () => {
      const onEvent = vi.fn(() => true);
      const { container } = render(
        <module.Controls
          killer={module.owner === "killer" ? module.match : "Hans"}
          location={
            module.owner === "location" ? module.match : "Camp Happy Trails"
          }
          finalGirl="Laurie"
          events={[]}
          onEvent={onEvent}
        />,
      );
      for (const capability of module.capabilities)
        expect(
          container.querySelector(`[data-module-control="${capability}"]`),
        ).not.toBeNull();
      expect(onEvent).not.toHaveBeenCalled();
      if (module.capabilities.includes("reveals"))
        for (const type of ["dark-power", "finale"] as const) {
          const cards = illustratedKillerCards(module.match, type);
          expect(cards.length).toBeGreaterThan(0);
          expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
          expect(cards.every((card) => !!card.art.src && !!card.effect)).toBe(
            true,
          );
        }
    });
  it("registers unique owner/match pairs and IDs", () => {
    expect(new Set(moduleDefinitions.map((module) => module.id)).size).toBe(
      moduleDefinitions.length,
    );
    expect(
      new Set(
        moduleDefinitions.map((module) => `${module.owner}:${module.match}`),
      ).size,
    ).toBe(moduleDefinitions.length);
  });
});

describe("shared player interaction contracts", () => {
  it("a known save conflict leaves the Boiler Room readable but prevents revealing or resolving cards", () => {
    const onEvent = vi.fn(() => true);
    const event = newPlayEvent({
      kind: "module",
      moduleData: {
        module: "fright",
        changes: {
          snapshot: JSON.stringify({
            ...initialFright(),
            mode: "digital",
            sleep: "asleep",
            cycle: 1,
            deal: "0132",
            reserve: "2301",
            path: "UUL",
            pending: true,
          }),
        },
      },
    });
    render(
      <FrightControls
        killer="Dr. Fright"
        location="Camp Happy Trails"
        finalGirl="Laurie"
        events={[
          newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
          event,
        ]}
        onEvent={onEvent}
        blocked
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Continue Boiler Room/ }),
    );
    expect(
      screen.getByText("Choose which saved game to continue."),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Attack resolved" }),
    ).toBeDisabled();
    expect(screen.queryAllByRole("button", { name: /^Slide / })).toHaveLength(
      0,
    );
    const stage = screen.getByRole("group", {
      name: "Boiler Room revealed cards",
    });
    expect(stage).toHaveAttribute("aria-disabled", "true");
    fireEvent.keyDown(stage, { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("button", { name: "Attack resolved" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to game" }));
    expect(onEvent).not.toHaveBeenCalled();
  });
  it("portrait disclosure never resurrects an ended character or changes their outcome", () => {
    const observed = vi.fn();
    function Person() {
      const [value, setValue] = useState<string>();
      return (
        <CharacterControl
          name="Visitor"
          value={value}
          present="in-play"
          art={art}
          states={[
            { value: "in-play", label: "In play" },
            { value: "saved", label: "Saved" },
            { value: "killed", label: "Killed" },
          ]}
          outcomes={["saved", "killed"]}
          onChange={(value) => {
            observed(value);
            setValue(value);
          }}
        />
      );
    }
    render(<Person />);
    expect(
      screen.getByRole("button", { name: "Mark Visitor saved" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Add Visitor" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark Visitor saved" }));
    fireEvent.click(screen.getByRole("button", { name: "View Visitor" }));
    expect(observed.mock.calls.map(([value]) => value)).toEqual([
      "in-play",
      "saved",
    ]);
    expect(
      screen.getByRole("button", { name: "Mark Visitor killed" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("combobox", { name: "Visitor status" }),
    ).toBeVisible();
  });
  it("an Event's artwork only activates once; ending and reactivation are explicit", () => {
    const observed = vi.fn();
    function Event() {
      const [value, setValue] = useState<string>();
      return (
        <EventControl
          name="Storm"
          value={value}
          art={art}
          onActivate={() => {
            observed("active");
            setValue("active");
          }}
          onEnd={() => {
            observed("ended");
            setValue("ended");
          }}
          onClear={() => {
            observed(null);
            setValue(undefined);
          }}
        />
      );
    }
    render(<Event />);
    fireEvent.click(screen.getByRole("button", { name: "Activate Storm" }));
    fireEvent.click(screen.getByRole("button", { name: "View Storm" }));
    expect(observed).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "End effect: Storm" }));
    fireEvent.click(screen.getByRole("button", { name: "View Storm" }));
    expect(observed.mock.calls.map(([value]) => value)).toEqual([
      "active",
      "ended",
    ]);
  });
  it("hearts remove/restore one health at either slot and keep zero distinct from unknown", () => {
    function Power() {
      const [health, setHealth] = useState<number>();
      return (
        <MinorPowerControl
          name="Nightfall"
          effect="Test rule"
          health={health}
          art={() => art}
          heartArt={art}
          onChange={setHealth}
        />
      );
    }
    render(<Power />);
    expect(screen.getByText("Test rule")).toBeInTheDocument();
    expect(
      screen.getByText("Not recorded", { selector: ".module-health-status" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reveal Nightfall" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove one Nightfall health, heart 2",
      }),
    );
    expect(
      screen.getByText("1/2 health", { selector: ".module-health-status" }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove one Nightfall health, heart 1",
      }),
    );
    expect(
      screen.getByText("Removed · 0/2 health", {
        selector: ".module-health-status",
      }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Restore one Nightfall health, heart 2",
      }),
    );
    expect(
      screen.getByText("1/2 health", { selector: ".module-health-status" }),
    ).toBeVisible();
  });
  it("legacy reveal evidence does not imply two remaining health", () => {
    const changed = vi.fn();
    render(
      <MinorPowerControl
        name="Old power"
        effect="Rule"
        previouslyRevealed
        art={() => art}
        heartArt={art}
        onChange={changed}
      />,
    );
    expect(
      screen.getByText("Revealed earlier · health not recorded"),
    ).toBeVisible();
    expect(
      screen.queryByRole("group", { name: "Old power health" }),
    ).toBeNull();
    expect(changed).not.toHaveBeenCalled();
  });
});

describe("durable module observation contract", () => {
  const change = (id: string) =>
    newPlayEvent({
      kind: "module",
      moduleData: { module: "camp", changes: { [`victim.${id}`]: "in-play" } },
    });
  it("deduplicates stale-render actions while allowing unrelated changes and later repeat observations", () => {
    const persist = vi.fn(() => true);
    const { result, rerender } = renderHook(
      ({ events }) => useModuleRecord(events, persist),
      { initialProps: { events: [] } },
    );
    act(() => {
      expect(result.current.record(change("boyfriend"))).toBe(true);
      expect(result.current.record(change("boyfriend"))).toBe(false);
      expect(result.current.record(change("girlfriend"))).toBe(true);
    });
    rerender({ events: [change("boyfriend"), change("girlfriend")] });
    act(() => {
      expect(result.current.record(change("boyfriend"))).toBe(true);
    });
    expect(persist).toHaveBeenCalledTimes(3);
  });
  it("a failed write is retryable without a reload or falsely advancing state", () => {
    const persist = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const { result } = renderHook(() => useModuleRecord([], persist));
    act(() => {
      expect(result.current.record(change("boyfriend"))).toBe(false);
    });
    expect(result.current.message).toContain("could not be saved");
    act(() => {
      expect(result.current.record(change("boyfriend"))).toBe(true);
    });
    expect(result.current.message).toBe("");
  });
});

it('one-Health Minor Powers reveal at one, show one heart, remove and restore exactly one, and disable every mutation', () => {
  function OneHeart({disabled=false}) {
    const [health,setHealth]=useState<number|undefined>();
    return <MinorPowerControl name="Endless Sleep" effect="Remain Asleep" maxHealth={1} disabled={disabled} health={health} art={()=>art} heartArt={art} onChange={n=>setHealth(n??undefined)}/>;
  }
  const view=render(<OneHeart/>);
  expect(screen.getByRole('article',{name:'Endless Sleep',exact:true})).toHaveAttribute('data-state','unrecorded');
  fireEvent.click(screen.getByRole('button',{name:'Reveal Endless Sleep'}));
  expect(screen.getByText('1/1 health')).toBeVisible();
  expect(view.container.querySelector('[data-state="full"]')).not.toBeNull();
  expect(screen.getByRole('group',{name:'Endless Sleep health'}).querySelectorAll('button')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button',{name:'Remove one Endless Sleep health, heart 1'}));
  expect(screen.getByText('Removed · 0/1 health',{selector:'p'})).toBeVisible();
  expect(screen.getByRole('article',{name:'Endless Sleep',exact:true})).toHaveAttribute('data-state','removed');
  fireEvent.click(screen.getByRole('button',{name:'Restore one Endless Sleep health, heart 1'}));
  view.rerender(<OneHeart disabled/>);
  expect(screen.getByRole('button',{name:'Remove one Endless Sleep health, heart 1'})).toBeDisabled();
  expect(screen.getByRole('combobox',{name:'Endless Sleep health correction'})).toBeDisabled();
  expect(screen.getByRole('button',{name:'Clear record: Endless Sleep'})).toBeDisabled();
});
