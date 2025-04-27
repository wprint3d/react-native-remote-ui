import * as React from 'react';
import { type RemoteComponentProps } from '../@types';

export default function RSC({
  source,
  openRemoteComponent,
  fallbackComponent,
  loadingComponent = <React.Fragment />,
  errorComponent = <React.Fragment />,
  ...extras
}: RemoteComponentProps): JSX.Element {
  const [RemoteComponent, setRemoteComponent] =
    React.useState<React.Component | null>(null);

  const [error, setError] = React.useState<Error | null>(null);

  const setComponent = React.useCallback(async () => {
    console.debug('[RemoteComponent] Attempting to load component');
    try {
      if (typeof openRemoteComponent === 'function') {
        const rsc = await openRemoteComponent(source);
        console.debug('[RemoteComponent] Successfully loaded component');
        return setRemoteComponent(() => rsc);
      }
      throw new Error(
        `[RemoteComponent]: typeof openRemoteComponent should be function`
      );
    } catch (e) {
      console.debug('[RemoteComponent] Error loading component:', e);
      setRemoteComponent(() => null);
      setError(e as Error);
    }
  }, [source, openRemoteComponent]);

  React.useEffect(() => {
    console.debug('[RemoteComponent] Component mount effect triggered');
    setComponent();
  }, [setComponent]);

  const FallbackComponent = React.useCallback((): JSX.Element => {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    return <></>;
  }, [fallbackComponent]);

  const ErrorComponent = React.useCallback((): JSX.Element => {
    if (errorComponent) {
      return errorComponent;
    }
    return <></>;
  }, [errorComponent]);

  const LoadingComponent = React.useCallback((): JSX.Element => {
    if (loadingComponent) {
      return loadingComponent;
    }
    return <></>;
  }, [loadingComponent]);

  if (typeof RemoteComponent === 'function') {
    console.debug('[RemoteComponent] Rendering remote component');
    return (
      <React.Fragment>
        <React.Suspense fallback={<FallbackComponent />} />
        {/* @ts-ignore */}
        <RemoteComponent {...extras} />
      </React.Fragment>
    );
  } else if (error) {
    console.debug('[RemoteComponent] Rendering error component');
    return <ErrorComponent />;
  }
  console.debug('[RemoteComponent] Rendering loading component');
  return <LoadingComponent />;
}
