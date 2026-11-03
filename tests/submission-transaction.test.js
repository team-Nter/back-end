import assert from 'node:assert/strict';
import test from 'node:test';
import { SubmissionService } from '../src/services/submission.service.js';
import { SubmissionRepository } from '../src/repositories/submission.repository.js';
import { ParticipationRepository } from '../src/repositories/participation.repository.js';
import { ChallengeRepository } from '../src/repositories/challenge.repository.js';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '#exceptions';

function setup({
  challengeMissing = false,
  status = 'APPROVED',
  participationMissing = false,
  expired = false,
  expireAfterLock = false,
  writeError,
} = {}) {
  const events = [];
  let saved;
  const challenge = {
    id: 7,
    status,
    deadlineAt: expired ? '2000-01-01' : '2099-01-01',
  };
  const query = (name) => ({
    where(values) {
      events.push(`${name}:where`);
      assert.deepEqual(
        values,
        name === 'Challenge' ? { id: 7 } : { challengeId: 7, userId: 2 },
      );
      return this;
    },
    select() {
      return this;
    },
    include() {
      return this;
    },
    forNoKeyUpdate() {
      events.push(`${name}:lock`);
      return this;
    },
    async first() {
      if (name === 'Challenge') return challengeMissing ? null : challenge;
      if (expireAfterLock) challenge.deadlineAt = '2000-01-01';
      return participationMissing ? null : { id: 42 };
    },
    async create(data) {
      events.push('create');
      if (writeError) throw writeError;
      saved = data;
      return {
        id: 10,
        participation: { user: { id: 2, nickname: '작성자', grade: 'NORMAL' } },
      };
    },
  });
  const tx = {
    orm: {
      public: {
        Challenge: query('Challenge'),
        Participation: query('Participation'),
        Submission: query('Submission'),
      },
    },
  };
  // 기본 DB로 쿼리하면 실패: 모든 repository가 같은 tx를 써야 한다.
  const db = {
    get orm() {
      throw new Error('Query escaped transaction');
    },
    async transaction(callback) {
      events.push('begin');
      try {
        const result = await callback(tx);
        events.push('commit');
        return result;
      } catch (error) {
        events.push('rollback');
        throw error;
      }
    },
  };
  const service = new SubmissionService({
    db,
    challengeRepository: new ChallengeRepository({ db }),
    participationRepository: new ParticipationRepository({ db }),
    submissionRepository: new SubmissionRepository({ db }),
  });
  return { service, events, saved: () => saved };
}

const data = { title: '제목', content: '내용', participationId: 999 };

test('생성의 잠금 조회와 저장이 같은 tx를 사용하고 참여 ID를 서버 값으로 대체한다', async () => {
  const fixture = setup();
  const result = await fixture.service.createSubmission('7', 2, data);
  assert.equal(result.author.id, 2);
  assert.equal(fixture.saved().participationId, 42);
  assert.equal(fixture.saved().challengeId, 7);
  assert.deepEqual(fixture.events, [
    'begin',
    'Challenge:where',
    'Challenge:lock',
    'Participation:where',
    'Participation:lock',
    'create',
    'commit',
  ]);
});

for (const [name, options, ErrorType] of [
  ['없는 챌린지', { challengeMissing: true }, NotFoundException],
  ['미승인 챌린지', { status: 'PENDING' }, ConflictException],
  ['마감된 챌린지', { expired: true }, ConflictException],
  ['참여하지 않은 사용자', { participationMissing: true }, ForbiddenException],
  ['참여 잠금 대기 중 마감', { expireAfterLock: true }, ConflictException],
]) {
  test(`${name}: 저장 없이 트랜잭션을 실패시킨다`, async () => {
    const fixture = setup(options);
    await assert.rejects(
      fixture.service.createSubmission(7, 2, data),
      ErrorType,
    );
    assert.equal(fixture.events.includes('create'), false);
    assert.equal(fixture.events.at(-1), 'rollback');
  });
}

test('DB 오류는 트랜잭션 밖으로 전파된다', async () => {
  const error = Object.assign(new Error('duplicate'), { sqlState: '23505' });
  const fixture = setup({ writeError: error });
  await assert.rejects(
    fixture.service.createSubmission(7, 2, data),
    (actual) => actual === error,
  );
  assert.equal(fixture.events.at(-1), 'rollback');
});

test('참여 잠금 조회는 tx 없이 실행할 수 없다', () => {
  const repository = new ParticipationRepository({ db: {} });
  assert.throws(
    () =>
      repository.findByChallengeIdAndUserIdForUpdate({
        challengeId: 7,
        userId: 2,
      }),
    /트랜잭션/,
  );
});
