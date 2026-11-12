// 시연용 시드 데이터 (faker.lorem 대신 쓰는 실제 같은 한글 데이터)
// - 제목 30자 · 설명 255자 · 닉네임 16자 · 사유 255자 제한을 지켜요 (DTO 검증 기준)
// - category · documentType은 #constants의 CHALLENGE_CATEGORIES · DOCUMENT_TYPES 값만 써요
// - 작업물 본문은 buildSubmissionContent()가 문장 조각을 무작위로 조합해서 만들어요
//   (seed.js의 faker.seed 덕분에 실행할 때마다 같은 결과, 작업물끼리는 서로 다른 내용)

// 유저 닉네임 20개 (1번은 어드민) — 실존 인물이 아닌 가상 닉네임
export const NICKNAMES = [
  '독스루관리자',
  '코딩하는곰',
  '리액트러버',
  '번역하는개발자',
  '타입요정',
  '프론트지망생',
  '노드냥이',
  '세미콜론',
  '버그헌터',
  '깃허브정원사',
  '자바스크립트덕후',
  '클린코더',
  '새벽커밋',
  '디버깅장인',
  '웹표준지킴이',
  '컴포넌트장인',
  '비동기마스터',
  '문서읽는사람',
  '야근없는개발',
  '코드리뷰어',
];

const NEXT = 'https://nextjs.org/docs/app';
const MDN = 'https://developer.mozilla.org/en-US/docs/Web';
const OFFICIAL = 'OFFICIAL_DOCUMENT';
const BLOG = 'BLOG';

// [제목, 원문 링크, 문서 타입, 한 줄 소개]
const SOURCES_BY_CATEGORY = {
  NEXTJS: [
    [
      'Next.js 설치하기',
      `${NEXT}/getting-started/installation`,
      OFFICIAL,
      'create-next-app으로 프로젝트를 시작하는 공식 가이드입니다.',
    ],
    [
      '프로젝트 구조',
      `${NEXT}/getting-started/project-structure`,
      OFFICIAL,
      'app 폴더와 파일 규칙으로 프로젝트를 구성하는 방법을 다룹니다.',
    ],
    [
      '레이아웃과 페이지',
      `${NEXT}/getting-started/layouts-and-pages`,
      OFFICIAL,
      'page.js와 layout.js로 화면을 만드는 방법을 설명합니다.',
    ],
    [
      '링크와 페이지 이동',
      `${NEXT}/getting-started/linking-and-navigating`,
      OFFICIAL,
      'Link 컴포넌트와 프리페치로 빠르게 이동하는 원리를 다룹니다.',
    ],
    [
      '서버 · 클라이언트 컴포넌트',
      `${NEXT}/getting-started/server-and-client-components`,
      OFFICIAL,
      '두 컴포넌트를 언제 써야 하는지 설명하는 문서입니다.',
    ],
    [
      '데이터 가져오기',
      `${NEXT}/getting-started/fetching-data`,
      OFFICIAL,
      '서버 컴포넌트에서 데이터를 가져오는 방법과 스트리밍을 소개합니다.',
    ],
    [
      '데이터 변경하기',
      `${NEXT}/getting-started/mutating-data`,
      OFFICIAL,
      '서버 함수로 데이터를 수정하고 화면을 갱신하는 방법을 다룹니다.',
    ],
    [
      '캐싱',
      `${NEXT}/getting-started/caching`,
      OFFICIAL,
      'Next.js의 캐싱이 어떻게 동작하는지 설명하는 문서입니다.',
    ],
    [
      '재검증',
      `${NEXT}/getting-started/revalidating`,
      OFFICIAL,
      '캐시된 데이터를 다시 가져오는 재검증 전략을 다룹니다.',
    ],
    [
      '에러 처리',
      `${NEXT}/getting-started/error-handling`,
      OFFICIAL,
      '예상한 에러와 예상하지 못한 에러를 다루는 방법을 설명합니다.',
    ],
    [
      'CSS 사용하기',
      `${NEXT}/getting-started/css`,
      OFFICIAL,
      'CSS Modules, 전역 CSS, Tailwind 등 스타일링 방법을 정리했습니다.',
    ],
    [
      '이미지 최적화',
      `${NEXT}/getting-started/images`,
      OFFICIAL,
      'Image 컴포넌트로 이미지를 최적화하는 방법을 다룹니다.',
    ],
    [
      '폰트 최적화',
      `${NEXT}/getting-started/fonts`,
      OFFICIAL,
      'next/font로 레이아웃 밀림 없이 폰트를 불러오는 방법입니다.',
    ],
    [
      '메타데이터와 OG 이미지',
      `${NEXT}/getting-started/metadata-and-og-images`,
      OFFICIAL,
      'SEO를 위한 메타데이터와 공유 이미지를 설정하는 방법입니다.',
    ],
    [
      '라우트 핸들러',
      `${NEXT}/getting-started/route-handlers`,
      OFFICIAL,
      'route.js로 API 엔드포인트를 만드는 방법을 설명합니다.',
    ],
    [
      '프록시',
      `${NEXT}/getting-started/proxy`,
      OFFICIAL,
      '요청이 완료되기 전에 코드를 실행하는 proxy 파일을 소개합니다.',
    ],
    [
      '배포하기',
      `${NEXT}/getting-started/deploying`,
      OFFICIAL,
      'Next.js 앱을 여러 환경에 배포하는 방법을 정리했습니다.',
    ],
    [
      '업그레이드하기',
      `${NEXT}/getting-started/upgrading`,
      OFFICIAL,
      '최신 버전으로 업그레이드하는 절차를 안내하는 문서입니다.',
    ],
    [
      'Link 컴포넌트 API',
      `${NEXT}/api-reference/components/link`,
      OFFICIAL,
      'Link 컴포넌트의 props와 동작을 정리한 API 문서입니다.',
    ],
    [
      '환경 변수 가이드',
      `${NEXT}/guides/environment-variables`,
      OFFICIAL,
      '.env 파일과 NEXT_PUBLIC_ 접두사의 의미를 설명합니다.',
    ],
    [
      '프로덕션 체크리스트',
      `${NEXT}/guides/production-checklist`,
      OFFICIAL,
      '배포 전에 확인하면 좋은 최적화 항목을 모은 가이드입니다.',
    ],
    [
      'Next.js 15 출시 소식',
      'https://nextjs.org/blog/next-15',
      BLOG,
      'Next.js 15의 주요 변경 사항을 소개하는 공식 블로그 글입니다.',
    ],
    [
      'Next.js 14 출시 소식',
      'https://nextjs.org/blog/next-14',
      BLOG,
      '서버 액션과 부분 프리렌더링을 소개한 블로그 글입니다.',
    ],
    [
      'Next.js 13 출시 소식',
      'https://nextjs.org/blog/next-13',
      BLOG,
      'App Router가 처음 공개된 버전을 소개하는 블로그 글입니다.',
    ],
  ],
  MODERN_JS: [
    [
      'Promise 이해하기',
      `${MDN}/JavaScript/Reference/Global_Objects/Promise`,
      OFFICIAL,
      'Promise의 세 가지 상태와 체이닝을 설명하는 MDN 문서입니다.',
    ],
    [
      'Promise 사용하기',
      `${MDN}/JavaScript/Guide/Using_promises`,
      OFFICIAL,
      '콜백 지옥을 Promise로 풀어내는 방법을 다루는 가이드입니다.',
    ],
    [
      'async 함수',
      `${MDN}/JavaScript/Reference/Statements/async_function`,
      OFFICIAL,
      'async와 await로 비동기 코드를 동기 코드처럼 쓰는 방법입니다.',
    ],
    [
      'JavaScript 모듈',
      `${MDN}/JavaScript/Guide/Modules`,
      OFFICIAL,
      'import와 export로 코드를 모듈 단위로 나누는 방법입니다.',
    ],
    [
      '클로저',
      `${MDN}/JavaScript/Guide/Closures`,
      OFFICIAL,
      '함수와 그 함수가 선언된 환경의 조합인 클로저를 설명합니다.',
    ],
    [
      '옵셔널 체이닝 연산자',
      `${MDN}/JavaScript/Reference/Operators/Optional_chaining`,
      OFFICIAL,
      '?. 연산자로 안전하게 속성에 접근하는 방법을 다룹니다.',
    ],
    [
      '널 병합 연산자',
      `${MDN}/JavaScript/Reference/Operators/Nullish_coalescing`,
      OFFICIAL,
      '?? 연산자와 || 연산자의 차이를 설명하는 문서입니다.',
    ],
    [
      '구조 분해 할당',
      `${MDN}/JavaScript/Reference/Operators/Destructuring`,
      OFFICIAL,
      '배열과 객체에서 값을 꺼내 변수에 담는 문법을 다룹니다.',
    ],
    [
      '전개 구문',
      `${MDN}/JavaScript/Reference/Operators/Spread_syntax`,
      OFFICIAL,
      '... 문법으로 배열과 객체를 펼치는 방법을 설명합니다.',
    ],
    [
      '화살표 함수',
      `${MDN}/JavaScript/Reference/Functions/Arrow_functions`,
      OFFICIAL,
      '화살표 함수의 문법과 this 바인딩 차이를 다룹니다.',
    ],
    [
      '클래스',
      `${MDN}/JavaScript/Reference/Classes`,
      OFFICIAL,
      '클래스 문법과 상속, private 필드를 설명하는 문서입니다.',
    ],
    [
      '템플릿 리터럴',
      `${MDN}/JavaScript/Reference/Template_literals`,
      OFFICIAL,
      '백틱으로 문자열 안에 값을 넣는 방법을 다룹니다.',
    ],
    [
      'Array.prototype.map()',
      `${MDN}/JavaScript/Reference/Global_Objects/Array/map`,
      OFFICIAL,
      '배열의 각 요소를 변환해 새 배열을 만드는 메서드입니다.',
    ],
    [
      'Array.prototype.reduce()',
      `${MDN}/JavaScript/Reference/Global_Objects/Array/reduce`,
      OFFICIAL,
      '배열을 하나의 값으로 줄여 나가는 메서드를 설명합니다.',
    ],
    [
      'Map 객체',
      `${MDN}/JavaScript/Reference/Global_Objects/Map`,
      OFFICIAL,
      '키-값 쌍을 순서대로 저장하는 Map을 소개합니다.',
    ],
    [
      'Set 객체',
      `${MDN}/JavaScript/Reference/Global_Objects/Set`,
      OFFICIAL,
      '중복 없는 값의 모음인 Set을 설명하는 문서입니다.',
    ],
    [
      '반복기와 생성기',
      `${MDN}/JavaScript/Guide/Iterators_and_generators`,
      OFFICIAL,
      '이터레이터 프로토콜과 제너레이터 함수를 다루는 가이드입니다.',
    ],
    [
      'Proxy 객체',
      `${MDN}/JavaScript/Reference/Global_Objects/Proxy`,
      OFFICIAL,
      '객체의 기본 동작을 가로채는 Proxy를 소개합니다.',
    ],
    [
      'React로 사고하기',
      'https://react.dev/learn/thinking-in-react',
      OFFICIAL,
      'UI를 컴포넌트로 나누고 상태를 설계하는 과정을 보여줍니다.',
    ],
    [
      'useState 레퍼런스',
      'https://react.dev/reference/react/useState',
      OFFICIAL,
      '컴포넌트에 상태를 추가하는 useState 훅의 API 문서입니다.',
    ],
    [
      'useEffect 레퍼런스',
      'https://react.dev/reference/react/useEffect',
      OFFICIAL,
      '외부 시스템과 동기화하는 useEffect 훅의 API 문서입니다.',
    ],
    [
      'React 19 출시',
      'https://react.dev/blog/2024/12/05/react-19',
      BLOG,
      'Actions와 새로운 훅을 소개하는 React 공식 블로그 글입니다.',
    ],
    [
      '더 빨라진 async 함수',
      'https://v8.dev/blog/fast-async',
      BLOG,
      'V8 엔진이 async 함수를 최적화한 과정을 설명하는 글입니다.',
    ],
    [
      'useEffect 완벽 가이드',
      'https://overreacted.io/a-complete-guide-to-useeffect/',
      BLOG,
      'useEffect를 깊이 있게 설명하는 유명한 블로그 글입니다.',
    ],
  ],
  API: [
    [
      'Fetch API 사용하기',
      `${MDN}/API/Fetch_API/Using_Fetch`,
      OFFICIAL,
      'fetch()로 요청을 보내고 응답을 처리하는 방법을 다룹니다.',
    ],
    [
      'AbortController',
      `${MDN}/API/AbortController`,
      OFFICIAL,
      '진행 중인 요청을 취소하는 AbortController를 소개합니다.',
    ],
    [
      'Intersection Observer API',
      `${MDN}/API/Intersection_Observer_API`,
      OFFICIAL,
      '요소가 화면에 보이는지 감지하는 API를 설명합니다.',
    ],
    [
      'Web Storage API',
      `${MDN}/API/Web_Storage_API`,
      OFFICIAL,
      'localStorage와 sessionStorage의 차이를 다루는 문서입니다.',
    ],
    [
      'History API',
      `${MDN}/API/History_API`,
      OFFICIAL,
      '브라우저 방문 기록을 다루는 History API를 소개합니다.',
    ],
    [
      'URL API',
      `${MDN}/API/URL`,
      OFFICIAL,
      'URL을 안전하게 만들고 분석하는 URL 객체를 설명합니다.',
    ],
    [
      'URLSearchParams',
      `${MDN}/API/URLSearchParams`,
      OFFICIAL,
      '쿼리 문자열을 읽고 쓰는 URLSearchParams를 다룹니다.',
    ],
    [
      'FormData',
      `${MDN}/API/FormData`,
      OFFICIAL,
      '폼 데이터를 키-값 쌍으로 만드는 FormData를 소개합니다.',
    ],
    [
      'Response 객체',
      `${MDN}/API/Response`,
      OFFICIAL,
      'fetch 응답을 나타내는 Response 객체를 설명합니다.',
    ],
    [
      'WebSocket API',
      `${MDN}/API/WebSockets_API`,
      OFFICIAL,
      '서버와 양방향으로 통신하는 WebSocket을 다룹니다.',
    ],
    [
      'Clipboard API',
      `${MDN}/API/Clipboard_API`,
      OFFICIAL,
      '클립보드를 읽고 쓰는 Clipboard API를 소개합니다.',
    ],
    [
      'Geolocation API',
      `${MDN}/API/Geolocation_API`,
      OFFICIAL,
      '사용자 위치를 가져오는 Geolocation API를 설명합니다.',
    ],
    [
      'Notifications API',
      `${MDN}/API/Notifications_API`,
      OFFICIAL,
      '브라우저 알림을 띄우는 Notifications API를 다룹니다.',
    ],
    [
      'ResizeObserver',
      `${MDN}/API/ResizeObserver`,
      OFFICIAL,
      '요소의 크기 변화를 감지하는 ResizeObserver를 소개합니다.',
    ],
    [
      'Web Workers API',
      `${MDN}/API/Web_Workers_API`,
      OFFICIAL,
      '무거운 작업을 백그라운드 스레드에서 처리하는 방법입니다.',
    ],
    [
      'File API',
      `${MDN}/API/File_API`,
      OFFICIAL,
      '사용자가 선택한 파일을 읽는 File API를 설명합니다.',
    ],
    [
      'HTTP 상태 코드',
      `${MDN}/HTTP/Status`,
      OFFICIAL,
      'HTTP 응답 상태 코드를 분류별로 정리한 문서입니다.',
    ],
    [
      'HTTP 요청 메서드',
      `${MDN}/HTTP/Methods`,
      OFFICIAL,
      'GET, POST, PATCH 등 요청 메서드의 의미를 다룹니다.',
    ],
    [
      '교차 출처 리소스 공유(CORS)',
      `${MDN}/HTTP/CORS`,
      OFFICIAL,
      '다른 출처의 리소스 요청을 허용하는 CORS를 설명합니다.',
    ],
    [
      'HTTP 쿠키',
      `${MDN}/HTTP/Cookies`,
      OFFICIAL,
      '쿠키의 동작 방식과 SameSite, Secure 속성을 다룹니다.',
    ],
    [
      'HTTP 캐싱',
      `${MDN}/HTTP/Caching`,
      OFFICIAL,
      'Cache-Control로 응답을 캐싱하는 방법을 설명합니다.',
    ],
    [
      'GitHub REST API 문서',
      'https://docs.github.com/en/rest',
      OFFICIAL,
      'GitHub REST API를 시작하는 방법을 다루는 공식 문서입니다.',
    ],
    [
      'REST API 설계 가이드',
      'https://restfulapi.net/',
      BLOG,
      'REST 원칙과 리소스 중심 URL 설계를 설명하는 글입니다.',
    ],
    [
      'Mock은 Stub이 아니다',
      'https://martinfowler.com/articles/mocksArentStubs.html',
      BLOG,
      '테스트 대역의 종류와 차이를 설명하는 유명한 글입니다.',
    ],
  ],
  WEB: [
    [
      'CSS 그리드 기본 개념',
      `${MDN}/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout`,
      OFFICIAL,
      '그리드 라인, 트랙, 셀 같은 기본 개념을 소개합니다.',
    ],
    [
      'Flexbox 기본 개념',
      `${MDN}/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox`,
      OFFICIAL,
      '주축과 교차축으로 요소를 배치하는 방법을 다룹니다.',
    ],
    [
      ':has() 선택자',
      `${MDN}/CSS/:has`,
      OFFICIAL,
      '특정 자식을 가진 부모를 선택하는 의사 클래스입니다.',
    ],
    [
      'CSS 명시도',
      `${MDN}/CSS/Specificity`,
      OFFICIAL,
      '여러 규칙이 겹칠 때 어떤 스타일이 이기는지 설명합니다.',
    ],
    [
      'position 속성',
      `${MDN}/CSS/position`,
      OFFICIAL,
      'relative, absolute, fixed, sticky의 차이를 다룹니다.',
    ],
    [
      'transform 속성',
      `${MDN}/CSS/transform`,
      OFFICIAL,
      '요소를 이동, 회전, 확대하는 transform을 설명합니다.',
    ],
    [
      'z-index 속성',
      `${MDN}/CSS/z-index`,
      OFFICIAL,
      '요소가 쌓이는 순서를 정하는 z-index를 다룹니다.',
    ],
    [
      '@media 규칙',
      `${MDN}/CSS/@media`,
      OFFICIAL,
      '화면 조건에 따라 스타일을 바꾸는 미디어 쿼리입니다.',
    ],
    [
      'clamp() 함수',
      `${MDN}/CSS/clamp`,
      OFFICIAL,
      '최솟값과 최댓값 사이로 크기를 제한하는 함수입니다.',
    ],
    [
      'aspect-ratio 속성',
      `${MDN}/CSS/aspect-ratio`,
      OFFICIAL,
      '요소의 가로세로 비율을 유지하는 속성을 설명합니다.',
    ],
    [
      '<dialog> 요소',
      `${MDN}/HTML/Element/dialog`,
      OFFICIAL,
      '모달과 대화 상자를 만드는 HTML 요소를 다룹니다.',
    ],
    [
      '<picture> 요소',
      `${MDN}/HTML/Element/picture`,
      OFFICIAL,
      '화면에 맞는 이미지를 골라 보여주는 요소입니다.',
    ],
    [
      '<img> 요소',
      `${MDN}/HTML/Element/img`,
      OFFICIAL,
      '이미지 요소와 alt, loading 속성을 설명합니다.',
    ],
    [
      'ARIA 소개',
      `${MDN}/Accessibility/ARIA`,
      OFFICIAL,
      '접근성을 높이는 ARIA 속성과 사용 원칙을 다룹니다.',
    ],
    [
      'Core Web Vitals',
      'https://web.dev/articles/vitals',
      BLOG,
      'LCP, INP, CLS 세 가지 핵심 지표를 소개하는 글입니다.',
    ],
    [
      'LCP 개선하기',
      'https://web.dev/articles/lcp',
      BLOG,
      '가장 큰 콘텐츠가 그려지는 시간을 줄이는 방법입니다.',
    ],
    [
      'CLS 이해하기',
      'https://web.dev/articles/cls',
      BLOG,
      '화면이 갑자기 밀리는 현상을 측정하는 지표를 다룹니다.',
    ],
    [
      'INP 이해하기',
      'https://web.dev/articles/inp',
      BLOG,
      '사용자 입력에 반응하는 속도를 측정하는 지표입니다.',
    ],
    [
      'CSS 배우기',
      'https://web.dev/learn/css',
      BLOG,
      'CSS의 기초부터 레이아웃까지 단계별로 배우는 코스입니다.',
    ],
    [
      'HTML 배우기',
      'https://web.dev/learn/html',
      BLOG,
      '시맨틱 HTML을 처음부터 배우는 학습 코스입니다.',
    ],
    [
      '접근성 배우기',
      'https://web.dev/learn/accessibility',
      BLOG,
      '모두가 쓸 수 있는 웹을 만드는 방법을 배우는 코스입니다.',
    ],
    [
      '반응형 디자인 배우기',
      'https://web.dev/learn/design',
      BLOG,
      '여러 화면 크기에 대응하는 디자인을 다루는 코스입니다.',
    ],
    [
      '폼 배우기',
      'https://web.dev/learn/forms',
      BLOG,
      '사용하기 편한 폼을 만드는 방법을 배우는 코스입니다.',
    ],
    [
      '이미지 배우기',
      'https://web.dev/learn/images',
      BLOG,
      '웹 이미지 포맷과 최적화를 다루는 학습 코스입니다.',
    ],
  ],
  CAREER: [
    [
      '조엘 테스트: 12단계',
      'https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/',
      BLOG,
      '개발 팀의 수준을 12가지 질문으로 점검하는 글입니다.',
    ],
    [
      '품질은 비용을 들일 가치가 있을까?',
      'https://martinfowler.com/articles/is-quality-worth-cost.html',
      BLOG,
      '코드 품질과 개발 속도의 관계를 다룬 글입니다.',
    ],
    [
      '기술 부채',
      'https://martinfowler.com/bliki/TechnicalDebt.html',
      BLOG,
      '기술 부채라는 비유를 설명하는 짧은 글입니다.',
    ],
    [
      '코드 스멜',
      'https://martinfowler.com/bliki/CodeSmell.html',
      BLOG,
      '리팩터링이 필요하다는 신호인 코드 스멜을 다룹니다.',
    ],
    [
      '리팩터링의 정의',
      'https://martinfowler.com/bliki/DefinitionOfRefactoring.html',
      BLOG,
      '리팩터링이 정확히 무엇인지 정의하는 글입니다.',
    ],
    [
      '지속적 전달',
      'https://martinfowler.com/bliki/ContinuousDelivery.html',
      BLOG,
      '언제든 배포할 수 있는 상태를 유지하는 방법입니다.',
    ],
    [
      '소스 코드 브랜치 관리 패턴',
      'https://martinfowler.com/articles/branching-patterns.html',
      BLOG,
      '여러 브랜치 전략의 장단점을 비교하는 긴 글입니다.',
    ],
    [
      '2018년 기준, 내가 모르는 것들',
      'https://overreacted.io/things-i-dont-know-as-of-2018/',
      BLOG,
      '모든 걸 알 필요는 없다는 메시지를 담은 글입니다.',
    ],
    [
      '클린 코드여, 안녕',
      'https://overreacted.io/goodbye-clean-code/',
      BLOG,
      '중복 제거에 집착했던 경험을 돌아보는 글입니다.',
    ],
    [
      'WET 코드베이스',
      'https://overreacted.io/the-wet-codebase/',
      BLOG,
      '섣부른 추상화의 위험을 이야기하는 글입니다.',
    ],
    [
      'memo 하기 전에',
      'https://overreacted.io/before-you-memo/',
      BLOG,
      'memo 없이 렌더링을 줄이는 두 가지 방법을 소개합니다.',
    ],
    [
      '탄탄한 컴포넌트 작성하기',
      'https://overreacted.io/writing-resilient-components/',
      BLOG,
      '변화에 강한 컴포넌트를 만드는 원칙을 다룹니다.',
    ],
    [
      '메이커의 일정, 매니저의 일정',
      'https://paulgraham.com/makersschedule.html',
      BLOG,
      '집중 시간과 회의 시간의 차이를 이야기하는 글입니다.',
    ],
    [
      'Julia Evans 블로그',
      'https://jvns.ca/',
      BLOG,
      '어려운 개발 개념을 쉬운 글로 풀어 쓰는 블로그입니다.',
    ],
    [
      'GitHub 블로그: 개발자 역량',
      'https://github.blog/developer-skills/',
      BLOG,
      '실무에 도움이 되는 개발 팁을 모은 블로그입니다.',
    ],
    [
      '유의적 버전',
      'https://semver.org/lang/ko/',
      OFFICIAL,
      '버전 번호를 붙이는 규칙인 SemVer 명세입니다.',
    ],
    [
      'Conventional Commits',
      'https://www.conventionalcommits.org/ko/v1.0.0/',
      OFFICIAL,
      '커밋 메시지를 일관되게 쓰는 규칙을 정리한 명세입니다.',
    ],
    [
      '변경 사항 기록하기',
      'https://keepachangelog.com/ko/1.1.0/',
      OFFICIAL,
      '읽기 좋은 CHANGELOG를 쓰는 방법을 안내합니다.',
    ],
    [
      '12 팩터 앱',
      'https://12factor.net/ko/',
      OFFICIAL,
      '서비스형 앱을 만드는 열두 가지 원칙을 정리했습니다.',
    ],
    [
      'Pro Git 책',
      'https://git-scm.com/book/ko/v2',
      OFFICIAL,
      'Git의 개념부터 브랜치 전략까지 다루는 공식 책입니다.',
    ],
    [
      'GitHub 풀 리퀘스트',
      'https://docs.github.com/en/pull-requests',
      OFFICIAL,
      '풀 리퀘스트로 협업하는 방법을 다루는 공식 문서입니다.',
    ],
    [
      'GitHub 코드 리뷰',
      'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests',
      OFFICIAL,
      '풀 리퀘스트에서 변경 사항을 리뷰하는 방법입니다.',
    ],
    [
      '구글 엔지니어링 코드 리뷰',
      'https://google.github.io/eng-practices/review/',
      BLOG,
      '구글의 코드 리뷰 가이드라인을 정리한 문서입니다.',
    ],
    [
      '좋은 커밋 메시지 작성법',
      'https://cbea.ms/git-commit/',
      BLOG,
      '좋은 커밋 메시지의 일곱 가지 규칙을 소개하는 글입니다.',
    ],
  ],
};

// 설명 뒷부분 (챌린지마다 돌아가며 붙여서 설명이 다양해지게)
const DESCRIPTION_TAILS = [
  '처음 읽는 분도 이해할 수 있게 자연스럽게 번역해 주세요.',
  '기술 용어는 원문을 괄호로 함께 적어 주세요.',
  '코드 예제는 그대로 두고 설명 위주로 번역해 주세요.',
  '원문의 흐름을 살리되 번역투는 줄여 주세요.',
  '핵심 개념이 잘 드러나도록 문장을 다듬어 주세요.',
  '필요하면 역주를 달아 맥락을 보충해 주세요.',
];

// 120개 챌린지 원문 목록 (분야 순서대로 모아 둔 것 — seed.js에서 섞어서 배정)
export const CHALLENGE_SOURCES = Object.entries(SOURCES_BY_CATEGORY).flatMap(
  ([category, items]) =>
    items.map(([title, sourceUrl, documentType, summary], index) => ({
      title,
      sourceUrl,
      description: `${summary} ${DESCRIPTION_TAILS[index % DESCRIPTION_TAILS.length]}`,
      category,
      documentType,
    })),
);

// ── 작업물 본문 생성용 조각 ─────────────────────────────────

// 분야별 핵심 용어 (문장 템플릿의 {term} 자리에 들어가요)
const TERMS_BY_CATEGORY = {
  NEXTJS: [
    'App Router',
    '서버 컴포넌트',
    '클라이언트 컴포넌트',
    '레이아웃',
    '라우트 세그먼트',
    '정적 렌더링',
    '동적 렌더링',
    '스트리밍',
    '프리페치',
    '캐시 무효화',
    '서버 함수',
    '메타데이터 API',
  ],
  MODERN_JS: [
    '비동기 처리',
    '이벤트 루프',
    '스코프 체인',
    '모듈 시스템',
    '구조 분해',
    '불변성',
    '고차 함수',
    '프로토타입',
    '제너레이터',
    '타입 변환',
    '렉시컬 환경',
    '상태 업데이트',
  ],
  API: [
    '요청 헤더',
    '응답 본문',
    '상태 코드',
    '쿼리 파라미터',
    '인증 토큰',
    '사전 요청(preflight)',
    '타임아웃 처리',
    '에러 응답',
    '직렬화',
    '스트림',
    '권한 요청',
    '재시도 전략',
  ],
  WEB: [
    '박스 모델',
    '쌓임 맥락',
    '레이아웃 흐름',
    '반응형 기준점',
    '시맨틱 마크업',
    '포커스 관리',
    '대체 텍스트',
    '렌더링 성능',
    '레이아웃 밀림',
    '색 대비',
    '미디어 쿼리',
    '키보드 접근성',
  ],
  CAREER: [
    '코드 리뷰',
    '리팩터링',
    '기술 부채',
    '테스트 코드',
    '배포 주기',
    '브랜치 전략',
    '문서화',
    '페어 프로그래밍',
    '회고',
    '커밋 메시지',
    '온보딩',
    '협업 문화',
  ],
};

// 소제목
// 첫 소제목 · 마지막 소제목 (흐름이 자연스럽게 시작하고 끝나도록)
const OPENING_HEADINGS = ['개요', '배경', '들어가며'];
const CLOSING_HEADINGS = ['정리', '마치며', '요약'];

// 문장 앞에 붙는 연결어 (같은 문장이라도 작업물마다 다르게 보이도록, 빈 값은 연결어 없음)
const SENTENCE_LEADS = [
  '',
  '',
  '',
  '특히 ',
  '또한 ',
  '참고로 ',
  '한편 ',
  '실제로 ',
  '무엇보다 ',
  '덧붙이자면, ',
  '다시 말해 ',
  '그래서 ',
];

// 가운데 소제목 (섞어서 사용)
const SECTION_HEADINGS = [
  '핵심 개념',
  '동작 방식',
  '기본 사용법',
  '예제 살펴보기',
  '자주 하는 실수',
  '주의할 점',
  '성능 고려 사항',
  '실무 적용 팁',
  '다른 방법과 비교',
  '더 알아보기',
  '단계별로 따라 하기',
  '문제 해결',
  '용어 정리',
];

// 문단 문장 템플릿 — {topic}: 챌린지 제목, {term}: 분야 용어 (조사가 어색하지 않게 작성)
const SENTENCE_TEMPLATES = [
  '이 문서는 {topic}에 대해 처음 접하는 개발자도 이해할 수 있도록 차근차근 설명합니다.',
  '{term} 개념을 먼저 이해하면 나머지 내용이 훨씬 쉽게 읽힙니다.',
  '원문에서는 {term} 부분을 간단한 예제와 함께 소개하고 있습니다.',
  '실제 프로젝트에서 {topic} 내용을 적용할 때 가장 먼저 부딪히는 부분이 바로 {term} 쪽입니다.',
  '많은 개발자가 {term} 부분을 대충 넘어갔다가 나중에 예상치 못한 버그를 만나곤 합니다.',
  '이 장에서는 {term} 동작을 단계별로 나누어 살펴봅니다.',
  '공식 문서는 {term} 사용을 권장하지만, 상황에 따라 다른 선택이 더 나을 수도 있다고 덧붙입니다.',
  '{topic} 문서를 읽기 전에 {term} 기본기를 한 번 복습해 두면 좋습니다.',
  '예제 코드를 직접 실행해 보면 {term} 동작이 훨씬 명확하게 보입니다.',
  '중요한 점은 {term} 부분이 항상 같은 방식으로 동작하지는 않는다는 것입니다.',
  '원문의 저자는 {term} 관련 설정을 기본값 그대로 두는 것부터 시작하라고 조언합니다.',
  '처음에는 {term} 개념이 낯설게 느껴질 수 있지만, 몇 번 써 보면 금방 익숙해집니다.',
  '{term} 부분을 잘못 이해하면 성능 문제나 예상하지 못한 화면 변화가 생길 수 있습니다.',
  '이 부분은 원문의 표현을 그대로 옮기기보다 의미가 잘 전달되도록 조금 풀어서 번역했습니다.',
  '{topic} 문서 전체에서 가장 자주 등장하는 단어는 {term} 개념입니다.',
  '다음 예제는 {term} 부분이 실제로 어떻게 쓰이는지 보여줍니다.',
  '결론적으로 {term} 개념은 {topic} 내용을 이해하는 데 꼭 필요한 기초입니다.',
  '원문은 {term} 관련 내용을 다른 장과 연결해서 읽어 보라고 안내합니다.',
  '팀으로 개발할 때는 {term} 규칙을 미리 정해 두면 리뷰 시간이 크게 줄어듭니다.',
  '{term} 쪽은 버전마다 조금씩 달라졌기 때문에, 오래된 블로그 글과 비교할 때 주의해야 합니다.',
  '이해를 돕기 위해 원문의 긴 문장 몇 개는 두 문장으로 나누어 번역했습니다.',
  '디버깅할 때는 {term} 상태를 먼저 확인하는 습관을 들이면 원인을 빨리 찾을 수 있습니다.',
  '원문에서 강조하는 핵심은 단순함입니다. {term} 부분을 필요 이상으로 복잡하게 만들지 말라는 것이죠.',
  '{term} 개념은 처음 설계할 때 결정해 두지 않으면 나중에 바꾸기 어렵습니다.',
  '이 내용은 {topic} 문서의 다른 장에서도 반복해서 등장하니 꼭 기억해 두세요.',
  '실무에서는 {term} 관련 문제를 줄이기 위해 린트 규칙이나 테스트를 함께 사용합니다.',
  '원문에 나온 그림을 글로 옮기면, {term} 흐름이 위에서 아래로 차례대로 진행된다는 뜻입니다.',
  '{term} 쪽을 다룰 때는 사용자가 실제로 겪는 경험을 먼저 떠올려 보는 것이 좋습니다.',
  '대부분의 경우 기본 설정만으로도 충분하지만, {term} 쪽은 직접 조정해야 할 때가 있습니다.',
  '이 예제에서 눈여겨볼 부분은 {term} 개념이 어디에서 처음 쓰이는지입니다.',
  '원문은 {term} 관련 흔한 오해 몇 가지를 짚고 넘어갑니다.',
  '처음 번역할 때는 {term} 표현이 어색했지만, 국내 문서들의 표기를 참고해 통일했습니다.',
  '{topic} 문서를 다 읽고 나면 {term} 부분을 다른 사람에게 설명할 수 있을 정도가 됩니다.',
  '같은 내용이라도 {term} 관점에서 다시 보면 새로운 점이 보입니다.',
  '원문은 짧지만 {term} 관련 핵심 내용을 빠짐없이 담고 있습니다.',
  '테스트 코드를 작성하면 {term} 동작을 바꿨을 때 생기는 문제를 빠르게 알아챌 수 있습니다.',
];

// 목록 항목 템플릿
const LIST_ITEM_TEMPLATES = [
  '{term} 개념을 먼저 정리하기',
  '공식 문서의 예제를 그대로 실행해 보기',
  '{term} 관련 기본값 확인하기',
  '에러 메시지를 끝까지 읽어 보기',
  '{term} 동작을 콘솔로 직접 확인하기',
  '작은 예제로 먼저 실험해 보기',
  '{term} 규칙을 팀원과 공유하기',
  '버전별 변경 사항 확인하기',
  '{term} 부분에 주석 남기기',
  '관련 테스트 코드 작성하기',
  '{term} 쪽 성능을 측정해 보기',
  '접근성과 사용자 경험도 함께 점검하기',
  '{term} 관련 공식 예제와 비교해 보기',
  '불필요한 코드는 과감하게 지우기',
];

// 분야별 코드 예제 (여러 줄)
const CODE_SNIPPETS_BY_CATEGORY = {
  NEXTJS: [
    "export default async function Page() {\n  const res = await fetch('https://api.example.com/posts');\n  const posts = await res.json();\n\n  return <PostList posts={posts} />;\n}",
    'export default function RootLayout({ children }) {\n  return (\n    <html lang="ko">\n      <body>{children}</body>\n    </html>\n  );\n}',
    "'use client';\n\nimport { useState } from 'react';\n\nexport default function LikeButton() {\n  const [liked, setLiked] = useState(false);\n  return <button onClick={() => setLiked(!liked)}>좋아요</button>;\n}",
    'import Link from \'next/link\';\n\nexport default function Nav() {\n  return (\n    <nav>\n      <Link href="/challenges">챌린지 목록</Link>\n    </nav>\n  );\n}',
    'export async function GET() {\n  const data = await getChallenges();\n  return Response.json(data);\n}',
    "export const metadata = {\n  title: '독스루',\n  description: '개발 문서 번역 챌린지 서비스',\n};",
  ],
  MODERN_JS: [
    'async function loadUser(id) {\n  try {\n    const res = await fetch(`/users/${id}`);\n    return await res.json();\n  } catch (error) {\n    console.error(error);\n  }\n}',
    "const { title, author = '익명' } = post;\nconst tags = [...post.tags, 'translation'];\nconsole.log(title, author, tags);",
    'function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\n\nconst counter = makeCounter();\ncounter(); // 1\ncounter(); // 2',
    'const total = items\n  .filter((item) => item.done)\n  .map((item) => item.point)\n  .reduce((sum, point) => sum + point, 0);',
    "const city = user?.address?.city ?? '알 수 없음';\nconsole.log(city);",
    'function* idGenerator() {\n  let id = 1;\n  while (true) {\n    yield id++;\n  }\n}',
  ],
  API: [
    "const res = await fetch('/api/challenges', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ title }),\n});\n\nif (!res.ok) {\n  throw new Error(`요청 실패: ${res.status}`);\n}",
    'const controller = new AbortController();\nconst timer = setTimeout(() => controller.abort(), 5000);\n\nawait fetch(url, { signal: controller.signal });\nclearTimeout(timer);',
    "const params = new URLSearchParams(location.search);\nparams.set('page', '2');\nhistory.pushState(null, '', `?${params}`);",
    "const observer = new IntersectionObserver(([entry]) => {\n  if (entry.isIntersecting) loadMore();\n});\n\nobserver.observe(document.querySelector('#sentinel'));",
    'HTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: max-age=60\n\n{ "items": [], "totalCount": 0 }',
    "const formData = new FormData(form);\nawait fetch('/api/upload', {\n  method: 'POST',\n  body: formData,\n});",
  ],
  WEB: [
    '.card-list {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 16px;\n}',
    '.toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}',
    '.card:has(img) {\n  padding: 0;\n}\n\n.card:hover {\n  transform: translateY(-4px);\n}',
    '@media (width <= 480px) {\n  .title {\n    font-size: clamp(18px, 5vw, 24px);\n  }\n}',
    '<dialog id="confirm">\n  <p>정말 삭제할까요?</p>\n  <button value="cancel">취소</button>\n  <button value="ok">삭제</button>\n</dialog>',
    '<picture>\n  <source srcset="hero.avif" type="image/avif" />\n  <img src="hero.jpg" alt="번역 챌린지 소개 이미지" loading="lazy" />\n</picture>',
  ],
  CAREER: [
    'feat: 챌린지 목록에 정렬 추가\n\n최신순 · 마감 임박순 정렬을 지원해요.\n검색어와 필터는 유지됩니다.',
    'git switch -c feat/challenge-list\ngit add .\ngit commit -m "feat: 챌린지 목록 화면"\ngit push -u origin feat/challenge-list',
    '## 변경 사항\n- 목록 정렬 추가\n\n## 테스트\n- [x] 최신순 정렬 확인\n- [x] 마감순 정렬 확인',
    '# Changelog\n\n## [1.1.0] - 2026-11-12\n### Added\n- 알림 모두 읽음 기능',
    'MAJOR.MINOR.PATCH\n\n1.0.0 → 1.0.1  버그 수정\n1.0.1 → 1.1.0  기능 추가\n1.1.0 → 2.0.0  호환되지 않는 변경',
    '회고 템플릿\n- 잘한 점(Keep)\n- 아쉬운 점(Problem)\n- 시도할 점(Try)',
  ],
};

// 번역자 한마디 (작업물 맨 앞, 없을 수도 있음)
const TRANSLATOR_NOTES = [
  '처음 번역해 보는 문서라 어색한 부분이 있을 수 있어요. 피드백 환영합니다!',
  '용어는 MDN 한국어 문서의 표기를 최대한 따랐어요.',
  '원문의 뉘앙스를 살리려고 일부 문장은 의역했어요.',
  '코드 예제는 원문 그대로 두고 설명만 번역했어요.',
  '어려운 용어는 원문을 괄호로 함께 적었어요.',
  '읽기 편하도록 긴 문장은 나누어 번역했어요.',
];

const fill = (template, topic, term) =>
  template.replaceAll('{topic}', topic).replaceAll('{term}', term);

const escapeHtml = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// 작업물 본문(Tiptap HTML) 만들기
// - sections: 최소 소제목 개수
// - minLines: 최소 줄 수 (마감된 챌린지는 100 → 모자라면 소제목을 더 붙여요)
// - faker: seed.js의 faker (faker.seed로 고정돼서 매번 같은 결과)
export function buildSubmissionContent(
  source,
  { sections, minLines = 0, faker },
) {
  const { title: topic, category } = source;
  const terms = TERMS_BY_CATEGORY[category];
  const snippets = CODE_SNIPPETS_BY_CATEGORY[category];

  // 한 작업물 안에서는 같은 문장이 반복되지 않도록 섞어서 앞에서부터 꺼내 써요
  const sentences = faker.helpers.shuffle([...SENTENCE_TEMPLATES]);
  const listItems = faker.helpers.shuffle([...LIST_ITEM_TEMPLATES]);
  const headings = faker.helpers.shuffle([...SECTION_HEADINGS]);
  let sentenceIndex = 0;
  let listIndex = 0;

  const nextSentence = () => {
    const template = sentences[sentenceIndex % sentences.length];
    sentenceIndex += 1;
    const lead = faker.helpers.arrayElement(SENTENCE_LEADS);
    // 제목에 '<dialog> 요소'처럼 태그 모양이 있어서, HTML로 해석되지 않게 이스케이프해요
    return escapeHtml(
      lead + fill(template, topic, faker.helpers.arrayElement(terms)),
    );
  };

  const nextListItem = () => {
    const template = listItems[listIndex % listItems.length];
    listIndex += 1;
    return escapeHtml(fill(template, topic, faker.helpers.arrayElement(terms)));
  };

  const html = [];

  if (faker.datatype.boolean({ probability: 0.6 })) {
    html.push(
      `<p><em>${faker.helpers.arrayElement(TRANSLATOR_NOTES)}</em></p>`,
    );
  }

  html.push(`<h2>${escapeHtml(topic)}</h2>`);
  html.push(`<p>${nextSentence()} ${nextSentence()}</p>`);

  for (
    let i = 0;
    i < sections || countContentLines(html.join('')) < minLines;
    i += 1
  ) {
    const heading =
      i === 0
        ? faker.helpers.arrayElement(OPENING_HEADINGS)
        : headings[(i - 1) % headings.length];
    html.push(`<h2>${heading}</h2>`);

    const paragraphCount = faker.number.int({ min: 2, max: 4 });
    for (let p = 0; p < paragraphCount; p += 1) {
      // 문단마다 2~3문장 (같은 문단이 다른 작업물에 그대로 나오지 않도록)
      const sentenceCount = faker.number.int({ min: 2, max: 3 });
      const text = Array.from({ length: sentenceCount }, nextSentence).join(
        ' ',
      );
      html.push(`<p>${text}</p>`);
    }

    if (faker.datatype.boolean({ probability: 0.6 })) {
      const items = Array.from(
        { length: faker.number.int({ min: 3, max: 5 }) },
        nextListItem,
      );
      html.push(`<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`);
    }

    if (faker.datatype.boolean({ probability: 0.5 })) {
      const code = escapeHtml(faker.helpers.arrayElement(snippets));
      html.push(`<pre><code>${code}</code></pre>`);
    }
  }

  // 소제목이 2개 이상이면 마지막에 정리 문단을 붙여요
  if (sections >= 2) {
    html.push(`<h2>${faker.helpers.arrayElement(CLOSING_HEADINGS)}</h2>`);
    html.push(`<p>${nextSentence()} ${nextSentence()}</p>`);
  }

  return html.join('');
}

// 화면에서 보이는 대략적인 줄 수 (문단 · 목록 항목 · 소제목 · 코드 한 줄을 각각 한 줄로 셈)
export function countContentLines(html) {
  const blocks = (html.match(/<(p|li|h2)>/g) ?? []).length;
  const codeLines = [...html.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)]
    .map(([, code]) => code.split('\n').length)
    .reduce((sum, n) => sum + n, 0);
  return blocks + codeLines;
}

// 피드백
export const FEEDBACKS = [
  '전체적으로 문장이 자연스러워서 읽기 편했어요! 용어 표기도 일관돼서 좋네요.',
  '두 번째 문단은 원문보다 조금 길어진 것 같아요. 한 문장으로 줄여 보면 어떨까요?',
  '코드 예제 설명이 특히 이해하기 쉬웠어요. 덕분에 개념이 정리됐습니다.',
  '"이행"보다는 "성공"이 더 직관적일 것 같기도 해요. 그래도 MDN 표기를 따른 건 좋은 선택 같아요.',
  '역주를 달아 주신 부분 덕분에 맥락이 확 이해됐어요. 최고예요 👍',
  '원문의 뉘앙스를 잘 살리신 것 같아요. 다만 마지막 문장은 직역에 가까워서 조금 어색했어요.',
  '목록으로 정리해 주셔서 한눈에 보기 좋네요!',
  '전문 용어 옆에 원문을 괄호로 같이 적어 주시면 검색할 때 더 편할 것 같아요.',
  '제가 번역한 것보다 훨씬 깔끔하네요. 많이 배우고 갑니다.',
  '오타가 하나 있는 것 같아요. 세 번째 문단 끝에 마침표가 두 번 찍혀 있어요.',
  '문장 길이가 적당해서 술술 읽혀요. 다음 챌린지도 기대할게요!',
  '첫 문단 번역이 정말 매끄러워요. 번역투가 거의 느껴지지 않네요.',
  '소제목을 원문과 조금 다르게 다듬으신 게 오히려 이해하기 좋았어요.',
  '예제 코드 위에 한 줄 설명을 추가해 주시면 더 친절할 것 같아요.',
  '용어 정리 부분 덕분에 처음 보는 개념도 금방 이해했어요. 감사합니다!',
  '전체 흐름은 좋은데, 중간에 존댓말과 반말이 섞인 부분이 있어요.',
  '원문보다 더 읽기 쉬운 것 같아요 ㅎㅎ 북마크해 두고 다시 볼게요.',
  '"쌓임 맥락"이라는 표현은 처음 봤는데 MDN 표기를 따르신 거군요. 배워 갑니다.',
  '실무 팁 부분은 원문에 없던 내용 같은데, 역주라고 표시해 주시면 좋을 것 같아요.',
  '번역 품질이 정말 좋네요. 최다 추천 받으실 것 같아요!',
  '{topic} 내용은 처음 보는데, 덕분에 흐름이 한 번에 잡혔어요.',
  '{topic} 원문이랑 같이 읽어 봤는데 빠진 부분 없이 꼼꼼하게 옮기셨네요.',
  '{topic} 문서에서 제일 헷갈리던 부분이 이 번역 덕분에 풀렸어요.',
  '코드 블록 앞뒤 설명이 원문보다 친절해서 좋았어요.',
  '중간에 한 문장이 원문 의미와 조금 다른 것 같아요. 한 번 더 확인해 주시면 좋겠어요.',
  '용어를 문서 전체에서 통일하신 점이 인상적이에요.',
  '번역 속도도 빠르신데 품질까지 좋네요. 비결이 궁금해요!',
  '조금 딱딱한 표현이 있어서, 존댓말 어미를 부드럽게 바꿔 보면 더 좋을 것 같아요.',
  '소제목 순서가 원문과 달라진 부분이 있는데, 의도하신 건지 궁금해요.',
  '목록 항목마다 마침표 유무가 달라요. 하나로 맞추면 더 깔끔할 것 같아요.',
];

// 피드백 앞뒤에 붙는 말 (같은 본문이라도 피드백마다 다르게 보이도록, 빈 값은 없음)
const FEEDBACK_OPENINGS = [
  '',
  '',
  '',
  '잘 읽었어요! ',
  '좋은 번역 감사합니다. ',
  '저도 같은 챌린지 참여 중인데요, ',
  '꼼꼼하게 읽어 봤어요. ',
  '번역 잘 봤습니다. ',
];

const FEEDBACK_CLOSINGS = [
  '',
  '',
  '',
  ' 고생하셨어요!',
  ' 다음 번역도 기대할게요.',
  ' 좋아요 누르고 갑니다 👍',
  ' 많이 배웠어요.',
  ' 참고만 해 주세요 🙂',
];

// 피드백 내용 만들기 ({topic}: 챌린지 제목)
export function buildFeedback(topic, faker) {
  const body = faker.helpers
    .arrayElement(FEEDBACKS)
    .replaceAll('{topic}', topic);
  return (
    faker.helpers.arrayElement(FEEDBACK_OPENINGS) +
    body +
    faker.helpers.arrayElement(FEEDBACK_CLOSINGS)
  );
}

// 어드민 거절 · 취소 사유
export const REJECT_REASONS = [
  '원문이 유료 구독 콘텐츠라 공개 번역 챌린지로 진행하기 어려워요.',
  '같은 문서로 이미 진행 중인 챌린지가 있어요. 기존 챌린지에 참여해 주세요.',
  '원문 링크에 접속할 수 없어요. 링크를 확인한 뒤 다시 신청해 주세요.',
  '분량이 너무 많아서 마감일 안에 번역하기 어려워 보여요. 문서를 나눠서 신청해 주세요.',
];

export const CANCEL_REASONS = [
  '원문 저작권자의 요청으로 챌린지를 종료했어요.',
  '원문 페이지가 삭제되어 챌린지를 더 이상 진행할 수 없어요.',
  '챌린지 내용이 서비스 운영 정책에 맞지 않아 삭제했어요.',
];

// 알림 메시지 — 백엔드 서비스가 실제로 만드는 문구와 똑같이 맞춰요
// (moderation-log.service.js · submission.service.js · feedback.service.js 참고)
export const NOTIFICATION_MESSAGES = {
  CHALLENGE_APPROVED: (title) => `'${title}' 챌린지 신청이 승인되었습니다.`,
  CHALLENGE_REJECTED: (title) => `'${title}' 챌린지 신청이 거절되었습니다.`,
  CHALLENGE_CANCELED: (title) => `참여중인 '${title}' 챌린지가 취소되었습니다.`,
  SUBMISSION_RECEIVED: (title) =>
    `'${title}' 챌린지에 새 작업물이 제출되었습니다.`,
  FEEDBACK_RECEIVED: (title) =>
    `'${title}' 챌린지의 내 작업물에 새 피드백이 등록되었습니다.`,
};

// 작업물 제목 (30자 제한)
export function toSubmissionTitle(challengeTitle) {
  return `${challengeTitle} 번역`.slice(0, 30);
}
