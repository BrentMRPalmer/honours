import type { App } from 'electron';

class AbstractController {
  app: App;

  constructor(app: App) {
    this.app = app;
  }
}

export { AbstractController };
