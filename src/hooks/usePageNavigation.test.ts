import { act, renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { usePageNavigation } from './usePageNavigation';

it('unwinds the actual route through collection, stats, and the theater', () => {
  const { result } = renderHook(() => usePageNavigation<string>('home'));
  act(() => result.current.navigate('stats'));
  act(() => result.current.navigate('archive'));
  act(() => result.current.navigate('archive'));
  act(() => result.current.back());
  expect(result.current.page).toBe('stats');
  act(() => result.current.back());
  expect(result.current.page).toBe('home');
  expect(result.current.canGoBack).toBe(false);
  act(() => result.current.back());
  expect(result.current.page).toBe('home');
});

it('branches from the page reached by Back instead of reviving a forward page', () => {
  const { result } = renderHook(() => usePageNavigation<string>('home'));
  act(() => result.current.navigate('nowPlaying'));
  act(() => result.current.navigate('archive'));
  act(() => result.current.back());
  act(() => result.current.navigate('rules'));
  act(() => result.current.back());
  expect(result.current.page).toBe('nowPlaying');
  act(() => result.current.back());
  expect(result.current.page).toBe('home');
});
