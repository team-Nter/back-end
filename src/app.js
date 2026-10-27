import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler, cors } from '#middlewares';

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
    this.app.use(cookieParser());
    this.app.use(cors);
    this.app.use((req, res, next) =>
      authMiddleware.authenticate(req, res, next),
    );
  }

  errorHandling() {
    this.app.use(errorHandler);
  }

  routes(controller) {
    this.app.use('/api', controller.routes());
  }

  listen(port) {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(port);

      server.once('error', reject);

      server.once('listening', () => {
        console.log(
          `[${this.#config.NODE_ENV}] Server running at http://localhost:${port}`,
        );
        resolve(server);
      });
    });
  }
}
