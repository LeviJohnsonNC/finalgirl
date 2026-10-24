import { act, cleanup, render } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { BoilerArtwork, type BoilerArtworkHandle } from "./BoilerArtwork";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("a rejected slide never mounts a new card or cutout and becomes retryable", () => {
  vi.useFakeTimers();
  const ref = createRef<BoilerArtworkHandle>();
  const save = vi.fn(() => false);
  const { container } = render(
    <BoilerArtwork
      ref={ref}
      path=""
      deal="2031"
      awake={false}
      revision="start"
      disabled={false}
      large={false}
      onSlide={save}
      onBusyChange={() => {}}
    />,
  );
  act(() => ref.current!.slide("U"));
  expect(save).toHaveBeenCalledTimes(1);
  expect(
    container.querySelectorAll(".boiler-card-layer:not(.boiler-cover)"),
  ).toHaveLength(0);
  act(() => vi.advanceTimersByTime(1000));
  expect(container.querySelector(".boiler-stage")).toHaveAttribute(
    "data-phase",
    "idle",
  );
  expect(container.querySelectorAll(".boiler-doctor")).toHaveLength(0);
  act(() => ref.current!.slide("U"));
  expect(save).toHaveBeenCalledTimes(2);
});

it("reveals only after successful settling, pops once, and never replays on defense or reopen", () => {
  vi.useFakeTimers();
  const ref = createRef<BoilerArtworkHandle>();
  const save = vi.fn();
  function Harness({ revision = "start" }) {
    const [path, setPath] = useState("");
    return (
      <BoilerArtwork
        ref={ref}
        path={path}
        deal="2031"
        awake={false}
        revision={revision + path}
        disabled={false}
        large={false}
        onBusyChange={() => {}}
        onSlide={(d) => {
          save();
          setPath((p) => p + d);
          return true;
        }}
      />
    );
  }
  const view = render(<Harness />);
  act(() => ref.current!.slide("U"));
  expect(view.container.querySelectorAll(".boiler-doctor")).toHaveLength(0);
  act(() => vi.advanceTimersByTime(220));
  expect(
    view.container.querySelectorAll(".boiler-doctor--entering"),
  ).toHaveLength(1);
  act(() => vi.advanceTimersByTime(400));
  expect(view.container.querySelectorAll(".boiler-doctor")).toHaveLength(1);
  expect(
    view.container.querySelectorAll(".boiler-doctor--entering"),
  ).toHaveLength(0);
  view.rerender(<Harness revision="defended" />);
  expect(
    view.container.querySelectorAll(".boiler-doctor--entering"),
  ).toHaveLength(0);
  view.unmount();
  const reopened = render(
    <BoilerArtwork
      path="U"
      deal="2031"
      awake={false}
      revision="defended"
      disabled
      large={false}
      onSlide={() => false}
      onBusyChange={() => {}}
    />,
  );
  expect(reopened.container.querySelectorAll(".boiler-doctor")).toHaveLength(1);
  expect(
    reopened.container.querySelectorAll(".boiler-doctor--entering"),
  ).toHaveLength(0);
  expect(save).toHaveBeenCalledTimes(1);
});
