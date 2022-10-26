import type { App } from 'vue';
import { lazy } from './lazy';

const directives = {
  lazy,
};

const install = (app: App) => {
  Object.entries(directives).forEach(([name, component]) => {
    app.directive(name, component);
  });
};

export default {
  install,
};
