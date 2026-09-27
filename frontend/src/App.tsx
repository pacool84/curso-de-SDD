import { SessionProvider } from './app/session';
import { AppRoutes } from './app/routes';

export function App() {
  return <SessionProvider><main className="mx-auto min-h-screen max-w-6xl p-6"><AppRoutes /></main></SessionProvider>;
}
