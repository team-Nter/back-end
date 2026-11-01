import express from 'express';

export class BaseController {
  constructor() {
    this.router = this.createRouter();
  }

  createRouter(options = {}) {
    return express.Router(options);
  }

  routes() {
    throw new Error('메서드를 구현해주세요.');
  }

  createRouter(options = {}) {
    return express.Router(options);
  }
}
