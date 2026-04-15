'use client';

import { createContext, startTransition, useContext, useEffect, useState } from 'react';

import { fetchCurrentUser, type SessionUser } from '@/lib/api/auth';
import { fetchServerStatus } from '@/lib/api/status';
import { publicEnv } from '@/lib/env';

type StatusKind = 'idle' | 'loading' | 'ready' | 'error';

type ServerStatusState = {
  checkedAt: string | null;
  description: string;
  label: string;
  status: StatusKind;
};

type SessionState = {
  label: string;
  status: StatusKind;
  user: SessionUser;
};

type AppContextValue = {
  apiBaseUrl: string | null;
  isRefreshing: boolean;
  refreshBootData: () => Promise<void>;
  serverStatus: ServerStatusState;
  session: SessionState;
  setSessionUser: (user: SessionUser) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

type AppProviderProps = Readonly<{
  children: React.ReactNode;
}>;

const initialServerStatus: ServerStatusState = {
  checkedAt: null,
  description: '앱이 부팅되면 API /status 를 확인합니다.',
  label: '준비 중',
  status: 'idle',
};

const initialSessionState: SessionState = {
  label: '세션 확인 전',
  status: 'idle',
  user: null,
};

export function AppProvider({ children }: AppProviderProps) {
  const [serverStatus, setServerStatus] = useState(initialServerStatus);
  const [session, setSession] = useState(initialSessionState);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshBootData() {
    if (!publicEnv.apiBaseUrl) {
      startTransition(() => {
        setServerStatus({
          checkedAt: new Date().toISOString(),
          description: 'NEXT_PUBLIC_API_BASE_URL 이 설정되지 않아 API 요청을 보내지 않았습니다.',
          label: '환경변수 필요',
          status: 'error',
        });
        setSession({
          label: '환경변수 필요',
          status: 'error',
          user: null,
        });
      });

      return;
    }

    setIsRefreshing(true);

    startTransition(() => {
      setServerStatus((current) => ({
        ...current,
        description: '백엔드 상태를 다시 확인하고 있습니다.',
        label: '확인 중',
        status: 'loading',
      }));
      setSession((current) => ({
        ...current,
        label: '확인 중',
        status: 'loading',
      }));
    });

    const checkedAt = new Date().toISOString();
    const [statusResult, sessionResult] = await Promise.allSettled([fetchServerStatus(), fetchCurrentUser()]);

    startTransition(() => {
      if (statusResult.status === 'fulfilled') {
        setServerStatus({
          checkedAt,
          description: `백엔드가 "${statusResult.value}" 응답을 반환했습니다.`,
          label: '연결됨',
          status: 'ready',
        });
      } else {
        setServerStatus({
          checkedAt,
          description: statusResult.reason instanceof Error ? statusResult.reason.message : 'API 상태 확인에 실패했습니다.',
          label: '실패',
          status: 'error',
        });
      }

      if (sessionResult.status === 'fulfilled') {
        const user = sessionResult.value;
        setSession({
          label: user ? '로그인됨' : '게스트',
          status: 'ready',
          user,
        });
      } else {
        setSession({
          label: '세션 오류',
          status: 'error',
          user: null,
        });
      }
    });

    setIsRefreshing(false);
  }

  function setSessionUser(user: SessionUser) {
    startTransition(() => {
      setSession({
        label: user ? '로그인됨' : '게스트',
        status: 'ready',
        user,
      });
    });
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshBootData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        apiBaseUrl: publicEnv.apiBaseUrl,
        isRefreshing,
        refreshBootData,
        serverStatus,
        session,
        setSessionUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider.');
  }

  return context;
}
