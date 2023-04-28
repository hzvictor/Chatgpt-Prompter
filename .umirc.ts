import { defineConfig } from 'umi';
import router from './router';
// import  'transform-remove-console'
export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: router,
  fastRefresh: {},
  exportStatic: {},
  links: [{ rel: 'icon', href: '/favicon.ico' }],
  dva: {},
  locale: {
    default: 'en-US',
    antd: true,
    title: false,
    baseNavigator: true,
    baseSeparator: '-',
  },
  title: 'Prompter Hub',
  dynamicImport: {loading:'@/loading'},
  // plugins: ["transform-remove-console"],
  chainWebpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
  },
});
