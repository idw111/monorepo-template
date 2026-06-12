/**
 * api와 www가 공유하는 타입 정의.
 *
 * 이 패키지는 빌드 산출물이 없는 타입 전용 패키지다.
 * 반드시 `import type { ... } from 'shared'` 형태로만 사용해야 하며,
 * 런타임 값(상수, 함수 등)을 export하면 api 빌드(dist)에서 모듈 해석에 실패한다.
 */

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  nickname: string;
}
