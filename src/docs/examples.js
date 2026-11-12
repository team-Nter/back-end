// Swagger 입력칸에 미리 채워지는 요청 예시 값입니다.
// 응답 예시는 schemas/ 폴더의 각 필드에 붙어 있습니다.

// 현재 시점보다 항상 이후로 잡아 오류 발생 막기
const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
deadline.setUTCHours(14, 59, 59, 0);

const challenge = {
  title: 'Next.js App Router 공식 문서 번역',
  sourceUrl: 'https://nextjs.org/docs/app',
  category: 'NEXTJS',
  documentType: 'OFFICIAL_DOCUMENT',
  deadlineAt: deadline.toISOString(),
  maxParticipants: 10,
  description: 'App Router 라우팅 문서를 함께 번역해요.',
};

const submission = {
  title: 'App Router 라우팅 문서 번역본',
  content: '## 라우팅\n\nApp Router는 React 서버 컴포넌트를 기반으로 합니다.',
};

export const EXAMPLES = {
  signUp: {
    email: 'docthru@example.com',
    password: 'password123',
    nickname: '독스루',
  },
  login: {
    email: 'docthru@example.com',
    password: 'password123',
  },
  createChallenge: challenge,
  // 수정은 바꿀 필드만 보내면 되므로 일부만 채워 둡니다.
  updateChallenge: {
    title: challenge.title,
    description: '라우팅과 데이터 페칭 문서까지 함께 번역해요.',
  },
  moderateChallenge: {
    action: 'REJECT',
    reason: '원문 링크가 올바르지 않습니다.',
  },
  createSubmission: submission,
  updateSubmission: {
    title: submission.title,
    content: submission.content,
  },
  deleteSubmission: {
    reason: '챌린지 주제와 관련 없는 내용입니다.',
  },
  saveDraft: {
    title: submission.title,
    content: '## 라우팅\n\n(번역 중)',
  },
  feedback: {
    content:
      '번역이 자연스러워요! 다만 "hydration"은 원문 그대로 두는 게 좋겠어요.',
  },
};
