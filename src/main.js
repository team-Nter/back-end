import { config } from '#config';
import { createContainer } from './common/di/container.js';
import { App } from './app.js';
import { setupGracefulShutdown } from './common/lifecycle/graceful-shutdown.js';

async function bootstrap() {
  const { controller, authMiddleware, db } = createContainer();

  const app = new App(controller, authMiddleware, config);
  const server = app.listen(config.PORT);

  setupGracefulShutdown(server, db);
}

bootstrap().catch((error) => {
  console.error('애플리케이션 시작 실패:', error);
  process.exitCode = EXIT_CODE.FAILURE;
});
