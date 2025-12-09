import { createContext, useContext } from 'react';

type NavigateFunction = (path: string) => void;

const NavigationContext = createContext<NavigateFunction | null>(null);

export function useNavigate(): NavigateFunction {
  const navigate = useContext(NavigationContext);
  if (!navigate) {
    return (path: string) => {
      window.location.href = path;
    };
  }
  return navigate;
}

export function LegalNavigationProvider({
  children,
  onNavigate
}: {
  children: React.ReactNode;
  onNavigate: NavigateFunction;
}) {
  return (
    <NavigationContext.Provider value={onNavigate}>
      {children}
    </NavigationContext.Provider>
  );
}
