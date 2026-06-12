import 'should';
import { getDatesBetween, getSeconds } from '@/utils/time';

describe('utils/time', () => {
  describe('getSeconds', () => {
    it('초 단위 문자열을 변환한다', () => {
      getSeconds('30s').should.equal(30);
    });

    it('분/시간/일 단위 문자열을 변환한다', () => {
      getSeconds('5m').should.equal(300);
      getSeconds('2h').should.equal(7200);
      getSeconds('1d').should.equal(86400);
    });

    it('지원하지 않는 형식은 0을 반환한다', () => {
      getSeconds('invalid').should.equal(0);
      getSeconds('1w').should.equal(0);
    });
  });

  describe('getDatesBetween', () => {
    it('시작일과 종료일 사이의 날짜 목록을 반환한다', () => {
      const dates = getDatesBetween('2026-01-01', '2026-01-03');
      dates.should.deepEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
    });

    it('시작일이 종료일보다 늦으면 순서를 바꿔 계산한다', () => {
      const dates = getDatesBetween('2026-01-03', '2026-01-01');
      dates.should.deepEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
    });
  });
});
