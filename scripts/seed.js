import { faker } from '@faker-js/faker';
import postgres from '@prisma/orm-postgres/runtime';
import bcrypt from 'bcrypt';
import contractJson from '../src/prisma/contract.json' with { type: 'json' };
import { fileURLToPath } from 'node:url';

const BCRYPT_SALT_ROUNDS = 10;

const CHALLENGES_PER_USER = 2;

const ACTION_BY_STATUS = {
  APPROVED: 'APPROVE',
  REJECTED: 'REJECT',
  CANCELED: 'CANCEL',
};

export class Seeder {
  #db;
  #numUsersToCreate;
  #hashedPassword;

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

  #makeUserInput(index) {
    const isAdmin = index === 1;

    return {
      email: isAdmin ? 'admin@example.com' : `user${index}@example.com`,
      nickname: `${faker.person.firstName()}_${index}`,
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

  #makeChallengeInput(requestorId) {
    return {
      requestorId,
      title: faker.lorem.sentence(5),
      sourceUrl: faker.internet.url(),
      description: faker.lorem.paragraph(5),
      category: faker.helpers.arrayElement([
        'next.js',
        'web',
        'api',
        'modernJS',
      ]),
      documentType: faker.helpers.arrayElement(['블로그', '공식문서']),
      deadlineAt: faker.date.future().toISOString(),
      maxParticipants: faker.number.int({ min: 3, max: 10 }), // 최대 인원 몇 명?
      status: faker.helpers.weightedArrayElement([
        { weight: 6, value: 'APPROVED' },
        { weight: 2, value: 'PENDING' },
        { weight: 1, value: 'REJECTED' },
        { weight: 1, value: 'CANCELED' },
      ]),
    };
  }

  async #seedChallenges(users) {
    const data = users.flatMap((user) =>
      this.#range(CHALLENGES_PER_USER).map(() =>
        this.#makeChallengeInput(user.id),
      ),
    );

    return await this.#insert('Challenge', data, [
      'id',
      'requestorId',
      'status',
      'maxParticipants',
    ]);
  }

  #makeParticipationInput(challengeId, userId) {
    return {
      challengeId,
      userId,
    };
  }

  async #seedParticipations(users, challenges) {
    const data = challenges.flatMap((challenge) => {
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

  #makeSubmissionInput(participation) {
    return {
      participationId: participation.id,
      challengeId: participation.challengeId,
      title: faker.lorem.sentence(5),
      content: faker.lorem.paragraph(8),
      isSelected: false,
      submittedAt: new Date().toISOString(),
    };
  }

  #makeSubmissionDraftInput(participation) {
    return {
      participationId: participation.id,
      title: faker.lorem.sentence(5),
      content: faker.lorem.paragraph(8),
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

  async #seedSubmissionLikes(users, submissions) {
    const data = submissions.flatMap((submission) =>
      faker.helpers
        .arrayElements(users, { min: 0, max: Math.min(3, users.length) })
        .map((user) => this.#makeSubmissionLikeInput(user.id, submission.id)),
    );

    return await this.#insert('SubmissionLike', data, [
      'userId',
      'submissionId',
    ]);
  }

  #makeFeedbackInput(submissionId, authorId) {
    return {
      submissionId,
      authorId,
      content: faker.lorem.paragraph(6),
    };
  }

  async #seedFeedbacks(users, submissions) {
    const data = submissions.flatMap((submission) =>
      faker.helpers
        .arrayElements(users, { min: 0, max: Math.min(2, users.length) })
        .map((user) => this.#makeFeedbackInput(submission.id, user.id)),
    );

    return await this.#insert('Feedback', data, ['id', 'submissionId']);
  }

  #makeNotificationInput({
    recipientId,
    type,
    challengeId = null,
    submissionId = null,
    feedbackId = null,
  }) {
    return {
      recipientId,
      type,
      message: faker.lorem.sentence(),
      challengeId,
      submissionId,
      feedbackId,
    };
  }

  async #seedNotifications({
    challenges,
    participations,
    submissions,
    likes,
    feedbacks,
  }) {
    const challengeById = new Map(challenges.map((c) => [c.id, c]));
    const participationById = new Map(participations.map((p) => [p.id, p]));
    const submissionById = new Map(submissions.map((s) => [s.id, s]));

    const authorIdOf = (submissionId) => {
      const submission = submissionById.get(submissionId);
      return participationById.get(submission.participationId).userId;
    };

    const data = [
      ...participations.map((p) =>
        this.#makeNotificationInput({
          recipientId: challengeById.get(p.challengeId).requestorId,
          type: 'CHALLENGE_PARTICIPATION',
          challengeId: p.challengeId,
        }),
      ),

      ...submissions.map((s) =>
        this.#makeNotificationInput({
          recipientId: challengeById.get(s.challengeId).requestorId,
          type: 'SUBMISSION_RECEIVED',
          challengeId: s.challengeId,
          submissionId: s.id,
        }),
      ),

      ...likes.map((l) =>
        this.#makeNotificationInput({
          recipientId: authorIdOf(l.submissionId),
          type: 'SUBMISSION_LIKED',
          submissionId: l.submissionId,
        }),
      ),

      ...feedbacks.map((f) =>
        this.#makeNotificationInput({
          recipientId: authorIdOf(f.submissionId),
          type: 'FEEDBACK_RECEIVED',
          submissionId: f.submissionId,
          feedbackId: f.id,
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
      reason: action === 'APPROVE' ? null : faker.lorem.sentence(),
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

    if (
      !protocolIsPostgreSql ||
      databaseUrl.hostname !==
        'dpg-dbg08259el5s73bga80g-a.singapore-postgres.render.com' ||
      databaseName !== 'nter' ||
      databaseUrl.search !== '?sslmode=require'
    ) {
      throw new Error(
        '시딩 대상 DB가 허용된 조건과 일치하지 않습니다. DATABASE_URL을 확인해 주세요.',
      );
    }
    //

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
    const admin = users.find((u) => u.role === 'ADMIN');

    const challenges = await this.#seedChallenges(users);
    const participations = await this.#seedParticipations(users, challenges);

    const submissions = await this.#seedSubmissions(participations);
    await this.#seedSubmissionDrafts(participations);

    const likes = await this.#seedSubmissionLikes(users, submissions);
    const feedbacks = await this.#seedFeedbacks(users, submissions);

    await this.#seedNotifications({
      challenges,
      participations,
      submissions,
      likes,
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

const seeder = new Seeder(db, 5);

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
