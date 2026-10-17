import { useCallback, useState } from 'react';

/** In-app page history, including the theater, without adding URL routes. */
export function usePageNavigation<Page extends string>(initialPage: Page) {
  const [state, setState] = useState<{ page: Page; history: Page[] }>({ page: initialPage, history: [] });
  const navigate = useCallback((page: Page) => {
    setState(previous => previous.page === page ? previous : { page, history: [...previous.history, previous.page] });
  }, []);
  const back = useCallback(() => {
    setState(previous => previous.history.length ? {
      page: previous.history[previous.history.length - 1], history: previous.history.slice(0, -1),
    } : previous);
  }, []);
  return { page: state.page, navigate, back, canGoBack: state.history.length > 0 };
}
