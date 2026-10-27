import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;
// 시드 계정은 모두 같은 비밀번호를 쓰면 로그인 테스트가 편해요
const SEED_PASSWORD = 'password1234!';
const CHALLENGES_PER_USER = 2;

// 챌린지 상태 -> 관리자 처리 이력(action) 대응표
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

  // ---------- 공통 도우미 ----------

  #range(n) {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  #now() {
    return new Date().toISOString();
  }

  // 빈 배열이면 DB 호출을 건너뛰고, 필요한 필드만 돌려받아요
  async #insert(model, data, fields = ['id']) {
    if (data.length === 0) return [];
    return await this.#db.orm.public[model].select(...fields).createAll(data);
  }

  // ---------- User ----------

  #makeUserInput(index) {
    const isAdmin = index === 1; // 첫 번째 사용자만 관리자

    return {
      email: isAdmin ? 'admin@example.com' : `user${index}@example.com`,
      nickname: `${faker.person.nickname()}_${index}`, // nickname은 unique라 번호를 붙여요
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

  // ---------- Challenge ----------

  #makeChallengeInput(requestorId) {
    return {
      requestorId, // 외래 키: User.id
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
      maxParticipants: faker.number.int({ min: 3, max: 10 }), // 고정값?
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

  // ---------- Participation ----------

  #makeParticipationInput(challengeId, userId) {
    return {
      challengeId, // 외래 키: Challenge.id
      userId, // 외래 키: User.id
      status: faker.helpers.weightedArrayElement([
        { weight: 8, value: 'ACTIVE' },
        { weight: 2, value: 'WITHDRAWN' },
      ]),
    };
  }

  async #seedParticipations(users, challenges) {
    // 승인된 챌린지에만 참여할 수 있고, 본인이 만든 챌린지에는 참여하지 않아요
    const approved = challenges.filter((c) => c.status === 'APPROVED');

    const data = approved.flatMap((challenge) => {
      const candidates = users.filter((u) => u.id !== challenge.requestorId);
      // [challengeId, userId] 조합은 unique라 중복 없이 뽑아요
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
      'status',
    ]);
  }

  // ---------- Submission / SubmissionDraft ----------

  #makeSubmissionInput(participation) {
    return {
      participationId: participation.id, // 외래 키 (unique: 참여 1건당 제출 1개)
      challengeId: participation.challengeId, // 외래 키
      title: faker.lorem.sentence(5),
      content: faker.lorem.paragraph(8),
      status: 'SUBMITTED',
      isSelected: false,
      submittedAt: this.#now(),
    };
  }

  #makeSubmissionDraftInput(participation) {
    return {
      participationId: participation.id, // 외래 키 (unique)
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

  // ---------- SubmissionLike ----------

  #makeSubmissionLikeInput(userId, submissionId) {
    return { userId, submissionId };
  }

  async #seedSubmissionLikes(users, submissions) {
    const data = submissions.flatMap((submission) =>
      // 복합 기본 키 [userId, submissionId]가 겹치지 않게 중복 없이 뽑아요
      faker.helpers
        .arrayElements(users, { min: 0, max: Math.min(3, users.length) })
        .map((user) => this.#makeSubmissionLikeInput(user.id, submission.id)),
    );

    return await this.#insert('SubmissionLike', data, [
      'userId',
      'submissionId',
    ]);
  }

  // ---------- Feedback ----------

  #makeFeedbackInput(submissionId, authorId) {
    return {
      submissionId, // 외래 키
      authorId, // 외래 키
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

  // ---------- Notification ----------

  #makeNotificationInput({
    recipientId,
    type,
    challengeId = null,
    submissionId = null,
    feedbackId = null,
  }) {
    return {
      recipientId, // 외래 키: 알림을 받는 User.id
      type,
      message: faker.lorem.sentence(),
      challengeId,
      submissionId,
      feedbackId,
    };
  }

  // 실제로 일어난 일(참여, 제출, 좋아요, 피드백)에 맞춰 알림을 만들어요
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

    // 제출물 작성자(User.id) 찾기: Submission -> Participation -> userId
    const authorIdOf = (submissionId) => {
      const submission = submissionById.get(submissionId);
      return participationById.get(submission.participationId).userId;
    };

    const data = [
      // 누가 참여하면 -> 챌린지를 만든 사람에게
      ...participations.map((p) =>
        this.#makeNotificationInput({
          recipientId: challengeById.get(p.challengeId).requestorId,
          type: 'CHALLENGE_PARTICIPATION',
          challengeId: p.challengeId,
        }),
      ),
      // 제출물이 올라오면 -> 챌린지를 만든 사람에게
      ...submissions.map((s) =>
        this.#makeNotificationInput({
          recipientId: challengeById.get(s.challengeId).requestorId,
          type: 'SUBMISSION_RECEIVED',
          challengeId: s.challengeId,
          submissionId: s.id,
        }),
      ),
      // 좋아요가 눌리면 -> 제출물 작성자에게
      ...likes.map((l) =>
        this.#makeNotificationInput({
          recipientId: authorIdOf(l.submissionId),
          type: 'SUBMISSION_LIKED',
          submissionId: l.submissionId,
        }),
      ),
      // 피드백이 달리면 -> 제출물 작성자에게
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

  // ---------- ModerationLog ----------

  #makeModerationLogInput(challenge, adminId) {
    const action = ACTION_BY_STATUS[challenge.status];

    return {
      challengeId: challenge.id, // 외래 키
      adminId, // 외래 키: 관리자 User.id
      action,
      reason: action === 'APPROVE' ? null : faker.lorem.sentence(),
    };
  }

  async #seedModerationLogs(admin, challenges) {
    // PENDING(대기)은 아직 처리 전이라 이력이 없어요
    const data = challenges
      .filter((c) => c.status !== 'PENDING')
      .map((c) => this.#makeModerationLogInput(c, admin.id));

    return await this.#insert('ModerationLog', data);
  }

  // ---------- 초기화 ----------

  // 자식(외래 키를 가진 쪽) -> 부모 순서로, 한 개씩 차례대로 지워요
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

  // ---------- 실행 ----------

  async seed() {
    // 비밀번호 해싱은 느려서 한 번만 해요
    this.#hashedPassword = await bcrypt.hash(SEED_PASSWORD, BCRYPT_SALT_ROUNDS);

    await this.#resetDb();

    // 부모 -> 자식 순서로 만들어야 외래 키 값(id)을 채울 수 있어요
    const users = await this.#seedUsers();
    const admin = users.find((u) => u.role === 'ADMIN');

    const challenges = await this.#seedChallenges(users);
    const participations = await this.#seedParticipations(users, challenges);

    // 참여 중인 사람 중 절반은 제출, 나머지는 임시 저장(draft)
    const active = participations.filter((p) => p.status === 'ACTIVE');
    const submitters = [];
    const draftOwners = [];
    for (const p of active) {
      (faker.datatype.boolean() ? submitters : draftOwners).push(p);
    }

    const submissions = await this.#seedSubmissions(submitters);
    await this.#seedSubmissionDrafts(draftOwners);

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
  }
}
