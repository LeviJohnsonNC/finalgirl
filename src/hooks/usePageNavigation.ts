import { useCallback, useState } from 'react';

/** In-app page history, including the theater, without adding URL routes. */
export function usePageNavigation<Page extends string>(initialPage: Page) {
  const [state, setState] = useState<{ page: Page; history: Page[] }>({ page: initialPage, history: [] });
  const navigate = useCallback((page: Page, options?: { replace?: boolean; omit?: readonly Page[] }) => {
    setState(previous => {
      if (previous.page === page) return previous;
      let history = options?.replace ? previous.history : [...previous.history, previous.page];
      if (options?.omit) history = history.filter(entry => !options.omit.includes(entry));
      if (history[history.length - 1] === page) history = history.slice(0, -1);
      return { page, history };
    });
  }, []);
  const back = useCallback(() => {
    setState(previous => previous.history.length ? {
      page: previous.history[previous.history.length - 1], history: previous.history.slice(0, -1),
    } : previous);
  }, []);
  return { page: state.page, navigate, back, canGoBack: state.history.length > 0 };
}
