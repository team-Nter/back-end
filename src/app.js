import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, cors, originGuard } from '#middlewares';
import { createOpenApiDocument } from './docs/openapi.js';

export class App {
  #config;

  constructor(controller, authMiddleware, config) {
    this.#config = config;
    this.app = express();
    this.middleware(authMiddleware);
    this.routes(controller);
    this.errorHandling();
  }

  middleware(authMiddleware) {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(cors);
    // 폼 본문(urlencoded)은 Swagger 입력칸 때문에 유지하고, 출처 검사로 CSRF를 막습니다.
    this.app.use(originGuard);
    this.app.use((req, res, next) =>
      authMiddleware.identifyUser(req, res, next),
    );
  }

  routes(controller) {
    this.app.get('/docs/openapi.json', (_req, res) =>
      res.json(createOpenApiDocument()),
    );
    this.app.use(
      '/docs',
      swaggerUi.serve,
      // 문서를 HTML에 고정해 넣지 않고, 열 때마다 openapi.json을 새로 받아오는 구조
      swaggerUi.setup(null, {
        swaggerOptions: { url: '/docs/openapi.json' },
        customSiteTitle: '독스루 API 문서',
        // 쿠키 인증은 Authorize 버튼으로 설정할 수 없어 숨깁니다.
        // 자물쇠 아이콘은 "로그인 필요" 표시로만 남기고 클릭은 막습니다.
        customCss: [
          '.swagger-ui .scheme-container .auth-wrapper { display: none }',
          '.swagger-ui .authorization__btn { pointer-events: none }',
        ].join('\n'),
      }),
    );

    this.app.use('/', controller.routes());
  }

  errorHandling() {
    this.app.use(errorHandler);
  }

  listen(port) {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(port);

      server.once('error', reject);

      server.once('listening', () => {
        console.log(
          `[${this.#config.NODE_ENV}] Server running at http://localhost:${port}`,
        );
        // 배포 환경에서는 공개 주소(API_BASE_URL), 로컬에서는 localhost로 표시됩니다.
        const baseUrl = this.#config.API_BASE_URL.replace(/\/+$/, '');
        console.log(`API 문서 : ${baseUrl}/docs`);
        resolve(server);
      });
    });
  }
}
