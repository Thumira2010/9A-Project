export interface RouteState {
  view: string;
  params: Record<string, string>;
}

export function parseCurrentRoute(): RouteState {
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view') || 'home';
  const params: Record<string, string> = {};

  urlParams.forEach((val, key) => {
    if (key !== 'view') {
      params[key] = val;
    }
  });

  return { view, params };
}

export function navigateToRoute(view: string, params: Record<string, any> = {}): void {
  const urlParams = new URLSearchParams();
  urlParams.set('view', view);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      urlParams.set(k, String(v));
    }
  });

  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.pushState({ view, params }, '', newUrl);

  // Dispatch custom popstate event so App component catches it synchronously
  window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view, params } }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function buildRouteUrl(view: string, params: Record<string, any> = {}): string {
  const urlParams = new URLSearchParams();
  urlParams.set('view', view);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      urlParams.set(k, String(v));
    }
  });
  return `${window.location.pathname}?${urlParams.toString()}`;
}
