import 'should';
import { getPaging } from '@/utils/paging';

describe('utils/paging', () => {
  describe('getPaging', () => {
    it('기본값을 반환한다', () => {
      const paging = getPaging({});
      paging.page!.should.equal(1);
      paging.pageSize!.should.equal(10);
      paging.offset.should.equal(0);
      paging.limit.should.equal(10);
    });

    it('page와 pageSize로 offset을 계산한다', () => {
      const paging = getPaging({ page: '3', pageSize: '20' });
      paging.page!.should.equal(3);
      paging.pageSize!.should.equal(20);
      paging.offset.should.equal(40);
      paging.limit.should.equal(20);
    });

    it('pageSize는 100을 넘지 않는다', () => {
      const paging = getPaging({ pageSize: 1000 });
      paging.pageSize!.should.equal(100);
    });

    it('잘못된 값은 기본값으로 대체한다', () => {
      const paging = getPaging({ page: 'abc', pageSize: 'xyz' });
      paging.page!.should.equal(1);
      paging.pageSize!.should.equal(10);
    });
  });
});
