import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SceneImageFrame } from './SceneImageFrame';

/**
 * The still is the payoff of a whole game, and the frame it sits in is a few
 * hundred pixels wide. Opening it full size is the one interaction the picture
 * has to support, so it is worth a test rather than an assumption.
 */
describe('SceneImageFrame', () => {
  it('opens the full-size image when the still is clicked', async () => {
    render(
      <SceneImageFrame
        variant="scene"
        imageUrl="https://example.test/still.png"
        isGenerating={false}
        caption="Reel 01 · Creech Manor"
      />,
    );

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /view scene still full size/i }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // The dialog shows the same source, not a placeholder or a second render
    // of the thumbnail-sized frame.
    const full = screen.getAllByRole('img').find((img) => img.closest('[role="dialog"]'));
    expect(full).toHaveAttribute('src', 'https://example.test/still.png');
  });

  it('offers a retry, and no image, when generation failed', () => {
    render(
      <SceneImageFrame
        variant="poster"
        imageUrl=""
        isGenerating={false}
        error="The gateway is out of credits."
        onRetry={() => {}}
      />,
    );

    expect(screen.getByText('The gateway is out of credits.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });
});
