'use client';

import { useAppContext } from '@/contexts/app-context';

const onboardingSteps = [
  'www/.env.local 에 NEXT_PUBLIC_API_BASE_URL 값을 api/.env 의 SERVER_URL 과 맞춰주세요.',
  '백엔드는 api 에서 npm run dev, 프론트는 루트에서 npm run dev:www 로 실행하면 됩니다.',
  '인증/대시보드/관리자 화면은 현재 Context API 와 axios 레이어 위에 바로 확장할 수 있습니다.',
];

function getStatusTone(status: 'idle' | 'loading' | 'ready' | 'error') {
  if (status === 'ready') {
    return 'bg-[color:rgba(22,101,52,0.12)] text-success';
  }

  if (status === 'error') {
    return 'bg-[color:rgba(180,35,24,0.12)] text-danger';
  }

  if (status === 'loading') {
    return 'bg-[color:rgba(15,118,110,0.12)] text-accent-strong';
  }

  return 'bg-[color:rgba(94,91,85,0.12)] text-muted';
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return '아직 확인되지 않음';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function HomePage() {
  const { apiBaseUrl, isRefreshing, refreshBootData, serverStatus, session } = useAppContext();

  return (
    <main className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.14),transparent_56%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 lg:px-10 lg:py-12">
        <section className="animate-rise-in overflow-hidden rounded-[2rem] border bg-panel/90 px-6 py-8 shadow-panel backdrop-blur lg:px-10 lg:py-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
                Next.js App Router + Tailwind v4 + Context API + Axios
              </p>
              <h1 className="max-w-2xl font-display text-4xl leading-tight text-balance text-ink sm:text-5xl">
                `www` 프론트엔드 스캐폴딩이 이제 모노리포 안에서 바로 확장 가능한 상태입니다.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                기존 Express/Sequelize 백엔드와 연결하기 쉽게 axios 인스턴스와 전역 상태 provider를 미리 구성해 두었습니다. 인증, 관리자 페이지, 대시보드 같은
                실제 화면을 여기에 이어붙이면 됩니다.
              </p>
            </div>

            <div className="animate-float rounded-[1.5rem] border bg-panel-strong px-5 py-4 shadow-float">
              <p className="text-sm font-medium text-muted">현재 API 엔드포인트</p>
              <p className="mt-2 break-all font-display text-lg text-ink">{apiBaseUrl ?? 'NEXT_PUBLIC_API_BASE_URL 미설정'}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-6">
            <article className="animate-rise-in rounded-[1.75rem] border bg-panel/90 p-6 shadow-panel [animation-delay:80ms]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">API 연결 상태</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">백엔드 헬스체크</h2>
                </div>

                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusTone(serverStatus.status)}`}>
                  {serverStatus.label}
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-muted">{serverStatus.description}</p>

              <div className="mt-6 flex flex-col gap-4 rounded-[1.25rem] bg-canvas/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">마지막 확인 시각</p>
                  <p className="mt-1 text-sm text-ink">{formatTimestamp(serverStatus.checkedAt)}</p>
                </div>

                <button
                  className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                  onClick={() => {
                    void refreshBootData();
                  }}
                  disabled={isRefreshing}
                  type="button"
                >
                  {isRefreshing ? '새로 확인하는 중...' : '상태 다시 확인'}
                </button>
              </div>
            </article>

            <article className="animate-rise-in rounded-[1.75rem] border bg-panel/90 p-6 shadow-panel [animation-delay:140ms]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">세션 상태</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">인증 컨텍스트</h2>
                </div>

                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusTone(session.status)}`}>{session.label}</span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.25rem] bg-canvas/90 p-4">
                  <p className="text-sm font-medium text-muted">이메일</p>
                  <p className="mt-2 text-sm text-ink">{session.user?.email ?? '로그인되지 않음'}</p>
                </div>
                <div className="rounded-[1.25rem] bg-canvas/90 p-4">
                  <p className="text-sm font-medium text-muted">닉네임</p>
                  <p className="mt-2 text-sm text-ink">{session.user?.nickname ?? '게스트'}</p>
                </div>
                <div className="rounded-[1.25rem] bg-canvas/90 p-4">
                  <p className="text-sm font-medium text-muted">권한</p>
                  <p className="mt-2 text-sm uppercase text-ink">{session.user?.role ?? 'none'}</p>
                </div>
              </div>
            </article>
          </div>

          <aside className="animate-rise-in rounded-[1.75rem] border bg-panel/90 p-6 shadow-panel [animation-delay:200ms]">
            <p className="text-sm font-medium text-muted">다음 작업 가이드</p>
            <h2 className="mt-2 font-display text-2xl text-ink">확장 포인트</h2>

            <ol className="mt-6 space-y-3">
              {onboardingSteps.map((step, index) => (
                <li className="flex gap-3 rounded-[1.1rem] bg-canvas/85 p-4" key={step}>
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-ink">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-[1.25rem] border border-dashed bg-[color:rgba(15,118,110,0.05)] p-4">
              <p className="text-sm font-medium text-muted">추천 구조</p>
              <p className="mt-2 text-sm leading-6 text-ink">
                `app/(auth)`, `app/(dashboard)`, `components/ui`, `lib/api`, `contexts` 조합으로 폴더를 늘려가면 App Router 와 현재 스캐폴딩이 자연스럽게
                이어집니다.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
