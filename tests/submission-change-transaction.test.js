import assert from 'node:assert/strict';
import test from 'node:test';
import { SubmissionService } from '../src/services/submission.service.js';
import { SubmissionRepository } from '../src/repositories/submission.repository.js';
import { ChallengeRepository } from '../src/repositories/challenge.repository.js';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

function setup(scenario) {
  const events = [];
  let locked = false;
  const original = {
    id: 10,
    challengeId: 7,
    isSelected: false,
    participation: { user: { id: 2 } },
  };
  const challenge = {
    id: 7,
    status: scenario === 'unapproved' ? 'PENDING' : 'APPROVED',
    deadlineAt: scenario === 'expired' ? '2000-01-01' : '2099-01-01',
  };
  const fresh = {
    ...original,
    isSelected: scenario === 'selected',
    participation: {
      user:
        scenario === 'deletedAuthor'
          ? null
          : { id: scenario === 'otherAuthor' ? 3 : 2 },
    },
  };
  const query = (model) => {
    let locking = false;
    return {
      where(values) {
        assert.deepEqual(values, { id: model === 'Challenge' ? 7 : 10 });
        return this;
      },
      select() {
        return this;
      },
      include() {
        assert.equal(locking, false, 'locking query cannot include relations');
        return this;
      },
      forNoKeyUpdate() {
        locking = true;
        return this;
      },
      async first() {
        if (model === 'Challenge') {
          assert.equal(locking, true);
          events.push('challenge:lock');
          return scenario === 'missingChallenge' ? null : challenge;
        }
        if (locking) {
          events.push('submission:lock');
          locked = true;
          if (scenario === 'expireAfterLock')
            challenge.deadlineAt = '2000-01-01';
          return scenario === 'deletedDuringWait' ? null : { id: 10 };
        }
        events.push(locked ? 'submission:fresh' : 'submission:initial');
        return scenario === 'missingSubmission'
          ? null
          : locked
            ? fresh
            : original;
      },
      async update(data) {
        assert.equal(locked, true);
        assert.deepEqual(data, { title: '수정', content: '내용' });
        events.push('update');
        if (scenario === 'writeError') throw new Error('write failed');
        return { ...fresh, ...data };
      },
      async delete() {
        assert.equal(locked, true);
        events.push('delete');
        if (scenario === 'writeError') throw new Error('write failed');
      },
    };
  };
  const tx = {
    orm: {
      public: {
        get Submission() {
          return query('Submission');
        },
        get Challenge() {
          return query('Challenge');
        },
      },
    },
  };
  const db = {
    get orm() {
      throw new Error('Query escaped transaction');
    },
    async transaction(callback) {
      events.push('begin');
      try {
        const value = await callback(tx);
        events.push('commit');
        return value;
      } catch (error) {
        events.push('rollback');
        throw error;
      }
    },
  };
  return {
    events,
    service: new SubmissionService({
      db,
      submissionRepository: new SubmissionRepository({ db }),
      challengeRepository: new ChallengeRepository({ db }),
    }),
  };
}

for (const method of ['updateSubmission', 'deleteSubmission']) {
  test(`${method}: 챌린지 → 작업물 잠금 후 같은 tx로 변경`, async () => {
    const { service, events } = setup('allowed');
    await service[method](10, 2, {
      title: '수정',
      content: '내용',
      isSelected: true,
    });
    assert.deepEqual(events, [
      'begin',
      'submission:initial',
      'challenge:lock',
      'submission:lock',
      'submission:fresh',
      method === 'updateSubmission' ? 'update' : 'delete',
      'commit',
    ]);
  });
  for (const [scenario, ErrorType] of [
    ['selected', ConflictException],
    ['expired', ConflictException],
    ['unapproved', ConflictException],
    ['expireAfterLock', ConflictException],
    ['otherAuthor', ForbiddenException],
    ['deletedAuthor', ForbiddenException],
    ['missingSubmission', NotFoundException],
    ['missingChallenge', NotFoundException],
    ['deletedDuringWait', NotFoundException],
  ]) {
    test(`${method}: ${scenario}이면 최신 상태로 거절하고 변경하지 않는다`, async () => {
      const { service, events } = setup(scenario);
      await assert.rejects(
        service[method](10, 2, { title: '수정', content: '내용' }),
        ErrorType,
      );
      assert.equal(
        events.includes('update') || events.includes('delete'),
        false,
      );
      assert.equal(events.at(-1), 'rollback');
    });
  }
  test(`${method}: 쓰기 실패를 트랜잭션 밖으로 전파`, async () => {
    const { service, events } = setup('writeError');
    await assert.rejects(
      service[method](10, 2, { title: '수정', content: '내용' }),
      /write failed/,
    );
    assert.equal(events.at(-1), 'rollback');
  });
}

test('작업물 잠금 조회는 tx가 필수다', async () => {
  const repository = new SubmissionRepository({ db: {} });
  await assert.rejects(repository.findByIdForUpdate(10), /트랜잭션/);
});
