'use client';

import {useEffect, useState} from 'react';
import type {ApiState} from '@/types/analytics';

export function useApiResource<T>(loader: () => Promise<T>, fallback: T): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: fallback,
    isLoading: true,
    error: null,
    source: 'mock'
  });

  useEffect(() => {
    let isMounted = true;

    setState((current) => ({...current, isLoading: true}));

    loader()
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setState({data, isLoading: false, error: null, source: 'api'});
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }
        setState({
          data: fallback,
          isLoading: false,
          error: error instanceof Error ? error.message : 'API is unavailable',
          source: 'mock'
        });
      });

    return () => {
      isMounted = false;
    };
  }, [fallback, loader]);

  return state;
}
