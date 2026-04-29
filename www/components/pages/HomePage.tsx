'use client';

import { useAppContext } from '@/contexts/app-context';

const setupItems = [
  'api/.env 와 www/.env.local 값을 맞춥니다.',
  '루트에서 npm run dev 로 API와 웹을 함께 실행합니다.',
  'components, contexts, lib/api 아래에 기능을 이어붙입니다.',
];

function getStatusTone(status: 'idle' | 'loading' | 'ready' | 'error') {
  if (status === 'ready') return 'bg-success/10 text-success';
  if (status === 'error') return 'bg-danger/10 text-danger';
  if (status === 'loading') return 'bg-accent/10 text-accent';
  return 'bg-muted/10 text-muted';
}

function formatTimestamp(value: string | null) {
  if (!value) return '아직 확인되지 않음';

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function HomePage() {
  const { apiBaseUrl, isRefreshing, refreshBootData, serverStatus, session } = useAppContext();

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">Monorepo Template</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Next.js + Express starter</h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted">프론트와 API 연결 상태만 간단히 확인하고, 필요한 기능을 바로 추가할 수 있는 기본 화면입니다.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border bg-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted">API</p>
                <h2 className="mt-1 font-display text-xl font-semibold">백엔드 상태</h2>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getStatusTone(serverStatus.status)}`}>{serverStatus.label}</span>
            </div>

            <p className="mt-4 min-h-12 text-sm leading-6 text-muted">{serverStatus.description}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <div>
                <dt className="text-muted">Endpoint</dt>
                <dd className="mt-1 break-all font-medium text-ink">{apiBaseUrl ?? 'NEXT_PUBLIC_API_BASE_URL 미설정'}</dd>
              </div>
              <div>
                <dt className="text-muted">Checked</dt>
                <dd className="mt-1 font-medium text-ink">{formatTimestamp(serverStatus.checkedAt)}</dd>
              </div>
            </dl>

            <button
              className="mt-5 inline-flex h-9 items-center rounded-md bg-ink px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                void refreshBootData();
              }}
              disabled={isRefreshing}
              type="button"
            >
              {isRefreshing ? '확인 중' : '다시 확인'}
            </button>
          </article>

          <article className="rounded-lg border bg-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted">Session</p>
                <h2 className="mt-1 font-display text-xl font-semibold">인증 상태</h2>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getStatusTone(session.status)}`}>{session.label}</span>
            </div>

            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="mt-1 font-medium text-ink">{session.user?.email ?? '로그인되지 않음'}</dd>
              </div>
              <div>
                <dt className="text-muted">Nickname</dt>
                <dd className="mt-1 font-medium text-ink">{session.user?.nickname ?? '게스트'}</dd>
              </div>
              <div>
                <dt className="text-muted">Role</dt>
                <dd className="mt-1 font-medium uppercase text-ink">{session.user?.role ?? 'none'}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="rounded-lg border bg-panel p-5">
          <h2 className="font-display text-lg font-semibold">Setup</h2>
          <ol className="mt-4 grid gap-3 text-sm text-muted">
            {setupItems.map((item, index) => (
              <li className="flex gap-3" key={item}>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-panel-strong text-xs font-semibold text-ink">{index + 1}</span>
                <span className="leading-6">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
