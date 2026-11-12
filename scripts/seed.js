import { faker } from '@faker-js/faker';
import postgres from '@prisma/orm-postgres/runtime';
import bcrypt from 'bcrypt';
import contractJson from '../src/prisma/contract.json' with { type: 'json' };
import { fileURLToPath } from 'node:url';
import {
  NICKNAMES,
  CHALLENGE_SOURCES,
  buildFeedback,
  REJECT_REASONS,
  CANCEL_REASONS,
  NOTIFICATION_MESSAGES,
  buildSubmissionContent,
  toSubmissionTitle,
} from './seed-data.js';

// 무작위 값(날짜 · 인원 · 상태 등)을 매번 같게 만들어 시연 데이터를 고정해요
faker.seed(99);

const BCRYPT_SALT_ROUNDS = 10;

// 유저 20명 × 6개 = 120개 (seed-data.js의 CHALLENGE_SOURCES 개수와 같아야 해요)
const USER_COUNT = 20;
const CHALLENGES_PER_USER = 6;

// 마감된 챌린지 작업물은 최다 추천으로 보여지니까 길게(100줄 이상) 만들어요
const CLOSED_SUBMISSION_MIN_LINES = 100;

// 좋아요는 "유저 1명당 1개"라서, 좋아요만 누르는 독자 계정을 따로 만들어요
// (좋아요 최대 개수 = 독자 수)
const READER_COUNT = 300;
const MAX_LIKES = 300;

// 작업물 하나에 달리는 피드백 최대 개수
const MAX_FEEDBACKS = 15;

// 한 번에 너무 많은 줄을 넣지 않도록 나눠서 넣어요 (좋아요가 수만 개라서)
const INSERT_CHUNK_SIZE = 5000;

const ACTION_BY_STATUS = {
  APPROVED: 'APPROVE',
  REJECTED: 'REJECT',
  CANCELED: 'CANCEL',
};

const NOTIFICATION_TYPE_BY_STATUS = {
  APPROVED: 'CHALLENGE_APPROVED',
  REJECTED: 'CHALLENGE_REJECTED',
};

const PARTICIPATABLE_STATUSES = ['APPROVED', 'CANCELED'];

export class Seeder {
  #db;
  #numUsersToCreate;
  #hashedPassword;
  #sourceByChallengeId = new Map();
  #challengeById = new Map();

  constructor(db, numUsersToCreate = 5) {
    this.#db = db;
    this.#numUsersToCreate = numUsersToCreate;
  }

  #range(n) {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  async #insert(model, data, fields = ['id']) {
    if (data.length === 0) return [];
    return await this.#db.orm.public[model].select(...fields).createAll(data);
  }

  async #insertInChunks(model, data, fields = ['id']) {
    const inserted = [];
    for (let i = 0; i < data.length; i += INSERT_CHUNK_SIZE) {
      const chunk = data.slice(i, i + INSERT_CHUNK_SIZE);
      inserted.push(...(await this.#insert(model, chunk, fields)));
    }
    return inserted;
  }

  #makeUserInput(index) {
    const isAdmin = index === 1;

    return {
      email: isAdmin ? 'admin@example.com' : `user${index}@example.com`,
      nickname: NICKNAMES[index - 1],
      passwordHash: this.#hashedPassword,
      role: isAdmin ? 'ADMIN' : 'USER',
    };
  }

  async #seedUsers() {
    const data = this.#range(this.#numUsersToCreate).map((index) =>
      this.#makeUserInput(index),
    );

    return await this.#insert('User', data, ['id', 'role']);
  }

  // 좋아요만 누르는 독자 계정 (챌린지 신청 · 참여 · 피드백에는 쓰지 않아요)
  async #seedReaders() {
    const data = this.#range(READER_COUNT).map((index) => ({
      email: `reader${index}@example.com`,
      nickname: `독자${index}`,
      passwordHash: this.#hashedPassword,
      role: 'USER',
    }));

    return await this.#insert('User', data, ['id']);
  }

  #makeChallengeInput(requestorId, source) {
    return {
      requestorId,
      title: source.title,
      sourceUrl: source.sourceUrl,
      description: source.description,
      category: source.category,
      documentType: source.documentType,
      deadlineAt: (faker.datatype.boolean({ probability: 0.7 })
        ? faker.date.future()
        : faker.date.past()
      ).toISOString(),
      maxParticipants: faker.number.int({ min: 3, max: 10 }),
      status: faker.helpers.weightedArrayElement([
        { weight: 6, value: 'APPROVED' },
        { weight: 2, value: 'PENDING' },
        { weight: 1, value: 'REJECTED' },
        { weight: 1, value: 'CANCELED' },
      ]),
    };
  }

  async #seedChallenges(users) {
    // 원문 목록을 섞은 뒤 하나씩 배정해요 (분야 · 문서 타입이 고르게 섞이고 제목은 겹치지 않음)
    const sources = faker.helpers.shuffle([...CHALLENGE_SOURCES]);
    const data = users.flatMap((user, userIndex) =>
      this.#range(CHALLENGES_PER_USER).map((n) =>
        this.#makeChallengeInput(
          user.id,
          sources[userIndex * CHALLENGES_PER_USER + (n - 1)],
        ),
      ),
    );

    const challenges = await this.#insert('Challenge', data, [
      'id',
      'requestorId',
      'title',
      'status',
      'maxParticipants',
      'deadlineAt',
    ]);

    // 작업물 · 임시저장에서 그 챌린지의 번역문을 찾을 수 있게 저장 (제목은 모두 달라요)
    for (const challenge of challenges) {
      const source = CHALLENGE_SOURCES.find((s) => s.title === challenge.title);
      this.#sourceByChallengeId.set(challenge.id, source);
      this.#challengeById.set(challenge.id, challenge);
    }

    return challenges;
  }

  #makeParticipationInput(challengeId, userId) {
    return {
      challengeId,
      userId,
    };
  }

  async #seedParticipations(users, challenges) {
    const data = challenges
      .filter((c) => PARTICIPATABLE_STATUSES.includes(c.status))
      .flatMap((challenge) => {
        const candidates = users.filter((u) => u.id !== challenge.requestorId);
        const joiners = faker.helpers.arrayElements(candidates, {
          min: Math.min(1, candidates.length),
          max: Math.min(challenge.maxParticipants, candidates.length),
        });

        return joiners.map((user) =>
          this.#makeParticipationInput(challenge.id, user.id),
        );
      });

    return await this.#insert('Participation', data, [
      'id',
      'challengeId',
      'userId',
    ]);
  }

  #isClosed(challengeId) {
    const { deadlineAt } = this.#challengeById.get(challengeId);
    return new Date(deadlineAt) <= new Date();
  }

  #makeSubmissionInput(participation) {
    const source = this.#sourceByChallengeId.get(participation.challengeId);
    const isClosed = this.#isClosed(participation.challengeId);

    return {
      participationId: participation.id,
      challengeId: participation.challengeId,
      title: toSubmissionTitle(source.title),
      // 작업물마다 문장 조합이 달라서 내용이 모두 달라요
      content: buildSubmissionContent(source, {
        sections: isClosed ? 10 : faker.number.int({ min: 3, max: 5 }),
        minLines: isClosed ? CLOSED_SUBMISSION_MIN_LINES : 0,
        faker,
      }),
      isSelected: false,
      submittedAt: new Date().toISOString(),
    };
  }

  #makeSubmissionDraftInput(participation) {
    const source = this.#sourceByChallengeId.get(participation.challengeId);

    return {
      participationId: participation.id,
      title: toSubmissionTitle(source.title),
      // 임시저장은 작성 중인 느낌으로 짧게
      content: buildSubmissionContent(source, { sections: 1, faker }),
    };
  }

  async #seedSubmissions(submitters) {
    const data = submitters.map((p) => this.#makeSubmissionInput(p));

    return await this.#insert('Submission', data, [
      'id',
      'challengeId',
      'participationId',
    ]);
  }

  async #seedSubmissionDrafts(draftOwners) {
    const data = draftOwners.map((p) => this.#makeSubmissionDraftInput(p));

    return await this.#insert('SubmissionDraft', data);
  }

  #makeSubmissionLikeInput(userId, submissionId) {
    return { userId, submissionId };
  }

  // 작업물 하나의 좋아요 개수 (0~300)
  // - 대부분은 적고 일부만 많도록 치우치게 뽑아요 (실제 서비스처럼)
  // - 마감된 챌린지는 오래 공개됐으니 조금 더 많게
  #pickLikeCount(challengeId) {
    const curve = this.#isClosed(challengeId) ? 1.8 : 3;
    // Math.random 대신 faker를 써야 faker.seed로 결과가 고정돼요
    return Math.round(
      MAX_LIKES * faker.number.float({ min: 0, max: 1 }) ** curve,
    );
  }

  async #seedSubmissionLikes(readers, submissions) {
    const likeCountBySubmissionId = new Map(
      submissions.map((s) => [s.id, this.#pickLikeCount(s.challengeId)]),
    );

    // 마감된 챌린지 일부는 1 · 2등 좋아요 수를 같게 맞춰서 "최다 추천 여러 개"가 나오게 해요
    const submissionsByChallengeId = Map.groupBy(
      submissions,
      (s) => s.challengeId,
    );
    for (const [challengeId, list] of submissionsByChallengeId) {
      if (!this.#isClosed(challengeId) || list.length < 2) continue;
      if (!faker.datatype.boolean({ probability: 0.4 })) continue;

      const [first, second] = [...list].sort(
        (a, b) =>
          likeCountBySubmissionId.get(b.id) - likeCountBySubmissionId.get(a.id),
      );
      likeCountBySubmissionId.set(
        second.id,
        likeCountBySubmissionId.get(first.id),
      );
    }

    const data = submissions.flatMap((submission) =>
      faker.helpers
        .arrayElements(readers, likeCountBySubmissionId.get(submission.id))
        .map((reader) =>
          this.#makeSubmissionLikeInput(reader.id, submission.id),
        ),
    );

    return await this.#insertInChunks('SubmissionLike', data, [
      'userId',
      'submissionId',
    ]);
  }

  async #seedSelections(challenges, submissions, likes) {
    const now = new Date();

    const closedChallenges = challenges.filter(
      (c) => c.status === 'APPROVED' && new Date(c.deadlineAt) <= now,
    );

    // 절반만 채택 완료 처리, 나머지는 "마감 후 처음 조회 시 채택" 테스트용으로 남김
    const processedChallenges = closedChallenges.filter(() =>
      faker.datatype.boolean(),
    );

    const likeCountBySubmissionId = new Map();
    for (const like of likes) {
      const count = likeCountBySubmissionId.get(like.submissionId) ?? 0;
      likeCountBySubmissionId.set(like.submissionId, count + 1);
    }
    const likeCountOf = (submission) =>
      likeCountBySubmissionId.get(submission.id) ?? 0;

    const selectedIds = processedChallenges.flatMap((challenge) => {
      const candidates = submissions.filter(
        (s) => s.challengeId === challenge.id,
      );
      const maxLikes = Math.max(0, ...candidates.map(likeCountOf));

      if (maxLikes === 0) return [];

      // 동점이면 모두 채택
      return candidates
        .filter((s) => likeCountOf(s) === maxLikes)
        .map((s) => s.id);
    });

    const processedIds = processedChallenges.map((c) => c.id);

    if (processedIds.length > 0) {
      await this.#db.orm.public.Challenge.where((c) =>
        c.id.in(processedIds),
      ).updateAll({ selectedAt: now.toISOString() });
    }

    if (selectedIds.length > 0) {
      await this.#db.orm.public.Submission.where((s) =>
        s.id.in(selectedIds),
      ).updateAll({ isSelected: true });
    }
  }

  #makeFeedbackInput(submission, authorId) {
    const { title } = this.#sourceByChallengeId.get(submission.challengeId);

    return {
      submissionId: submission.id,
      authorId,
      content: buildFeedback(title, faker),
    };
  }

  // 피드백 개수는 좋아요가 많은 작업물일수록 많게 (0~15개, 화면에서는 3개씩 더 보기)
  #pickFeedbackCount(likeCount) {
    const count =
      Math.round(likeCount / 25) + faker.number.int({ min: 0, max: 3 });
    return Math.min(count, MAX_FEEDBACKS);
  }

  // 작성자는 메인 유저(작업물 작성자 제외)를 먼저 쓰고, 모자라면 독자 계정으로 채워요
  async #seedFeedbacks({ users, readers, participations, submissions, likes }) {
    const authorIdByParticipationId = new Map(
      participations.map((p) => [p.id, p.userId]),
    );
    const likeCountBySubmissionId = new Map();
    for (const like of likes) {
      const count = likeCountBySubmissionId.get(like.submissionId) ?? 0;
      likeCountBySubmissionId.set(like.submissionId, count + 1);
    }

    const data = submissions.flatMap((submission) => {
      const count = this.#pickFeedbackCount(
        likeCountBySubmissionId.get(submission.id) ?? 0,
      );
      const submissionAuthorId = authorIdByParticipationId.get(
        submission.participationId,
      );
      const others = users.filter((u) => u.id !== submissionAuthorId);
      const mainAuthors = faker.helpers.arrayElements(
        others,
        Math.min(count, others.length),
      );
      const readerAuthors = faker.helpers.arrayElements(
        readers,
        count - mainAuthors.length,
      );

      return [...mainAuthors, ...readerAuthors].map((author) =>
        this.#makeFeedbackInput(submission, author.id),
      );
    });

    return await this.#insertInChunks('Feedback', data, ['id', 'submissionId']);
  }

  #makeNotificationInput({
    recipientId,
    type,
    title,
    challengeId = null,
    submissionId = null,
    feedbackId = null,
  }) {
    return {
      recipientId,
      type,
      message: NOTIFICATION_MESSAGES[type](title),
      challengeId,
      submissionId,
      feedbackId,
    };
  }

  // 실제 서비스가 만드는 알림 종류만 만들어요 (참여 · 좋아요 알림은 서비스에 없어서 제외)
  async #seedNotifications({
    challenges,
    participations,
    submissions,
    feedbacks,
  }) {
    const challengeById = new Map(challenges.map((c) => [c.id, c]));
    const participationById = new Map(participations.map((p) => [p.id, p]));
    const submissionById = new Map(submissions.map((s) => [s.id, s]));

    const authorIdOf = (submissionId) => {
      const submission = submissionById.get(submissionId);
      return participationById.get(submission.participationId).userId;
    };

    const titleOf = (challengeId) => challengeById.get(challengeId).title;

    const data = [
      ...submissions.map((s) =>
        this.#makeNotificationInput({
          recipientId: challengeById.get(s.challengeId).requestorId,
          type: 'SUBMISSION_RECEIVED',
          title: titleOf(s.challengeId),
          challengeId: s.challengeId,
          submissionId: s.id,
        }),
      ),

      ...feedbacks.map((f) => {
        const { challengeId } = submissionById.get(f.submissionId);
        return this.#makeNotificationInput({
          recipientId: authorIdOf(f.submissionId),
          type: 'FEEDBACK_RECEIVED',
          title: titleOf(challengeId),
          challengeId,
          submissionId: f.submissionId,
          feedbackId: f.id,
        });
      }),

      ...challenges
        .filter((c) => NOTIFICATION_TYPE_BY_STATUS[c.status])
        .map((c) =>
          this.#makeNotificationInput({
            recipientId: c.requestorId,
            type: NOTIFICATION_TYPE_BY_STATUS[c.status],
            title: c.title,
            challengeId: c.id,
          }),
        ),

      ...participations
        .filter((p) => challengeById.get(p.challengeId).status === 'CANCELED')
        .map((p) =>
          this.#makeNotificationInput({
            recipientId: p.userId,
            type: 'CHALLENGE_CANCELED',
            title: titleOf(p.challengeId),
            challengeId: p.challengeId,
          }),
        ),
    ];

    return await this.#insert('Notification', data);
  }

  #makeModerationLogInput(challenge, adminId) {
    const action = ACTION_BY_STATUS[challenge.status];

    return {
      challengeId: challenge.id,
      adminId,
      action,
      reason:
        action === 'REJECT'
          ? faker.helpers.arrayElement(REJECT_REASONS)
          : action === 'CANCEL'
            ? faker.helpers.arrayElement(CANCEL_REASONS)
            : null,
    };
  }

  async #seedModerationLogs(admin, challenges) {
    const data = challenges
      .filter((c) => c.status !== 'PENDING')
      .map((c) => this.#makeModerationLogInput(c, admin.id));

    return await this.#insert('ModerationLog', data);
  }

  async #resetDb() {
    const modelsInDeleteOrder = [
      'ModerationLog',
      'Notification',
      'Feedback',
      'SubmissionLike',
      'SubmissionDraft',
      'Submission',
      'Participation',
      'Challenge',
      'User',
    ];

    for (const model of modelsInDeleteOrder) {
      await this.#db.orm.public[model].deleteAll();
    }
  }

  async seed() {
    // 환경 검증
    // 검증 항목 : url 검증, postgres 데이터베이스인지 확인, url내의 항목들

    if (process.env.NODE_ENV !== 'development') {
      throw new Error('시딩은 프로덕션 환경에서 실행하지 않습니다.');
    }

    let databaseUrl;
    try {
      databaseUrl = new URL(process.env.DATABASE_URL);
    } catch {
      throw new Error('올바른 DATABASE_URL이 필요합니다');
    }

    const protocolIsPostgreSql = ['postgres:', 'postgresql:'].includes(
      databaseUrl.protocol,
    );
    const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));

    const sslModes = databaseUrl.searchParams.getAll('sslmode');

    if (
      !protocolIsPostgreSql ||
      databaseUrl.hostname !==
        'dpg-dbg08259el5s73bga80g-a.singapore-postgres.render.com' ||
      databaseName !== 'nter' ||
      sslModes.length !== 1 ||
      sslModes[0] !== 'require'
    ) {
      throw new Error(
        '시딩 대상 DB가 허용된 조건과 일치하지 않습니다. DATABASE_URL을 확인해 주세요.',
      );
    }
    // 검증 완료

    console.log('시딩 시작');

    const seedPassword = process.env.SEED_PASSWORD;

    if (!seedPassword) {
      throw new Error('SEED_PASSWORD 환경 변수가 설정되지 않았습니다.');
    }

    this.#hashedPassword = await bcrypt.hash(seedPassword, BCRYPT_SALT_ROUNDS);

    await this.#resetDb();
    console.log('데이터 초기화');

    const users = await this.#seedUsers();
    const readers = await this.#seedReaders();
    const admin = users.find((u) => u.role === 'ADMIN');

    const challenges = await this.#seedChallenges(users);
    const participations = await this.#seedParticipations(users, challenges);

    const submissions = await this.#seedSubmissions(participations);
    await this.#seedSubmissionDrafts(participations);

    const likes = await this.#seedSubmissionLikes(readers, submissions);
    const feedbacks = await this.#seedFeedbacks({
      users,
      readers,
      participations,
      submissions,
      likes,
    });
    await this.#seedSelections(challenges, submissions, likes);

    await this.#seedNotifications({
      challenges,
      participations,
      submissions,
      feedbacks,
    });
    await this.#seedModerationLogs(admin, challenges);
    console.log('데이터 생성');
  }
}

const db = postgres({
  contract: contractJson,
  url: process.env.DATABASE_URL,
});

const seeder = new Seeder(db, USER_COUNT);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seeder
    .seed()
    .catch((e) => {
      console.error('❌ 시딩 에러:', e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await db.close();
    });
}
