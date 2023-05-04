export default [
  {
    path: '/',
    component: '@/layouts/global/index',
    routes: [
      { exact: false, path: '/chat/:projectid', component: '@/pages/chat/index' },
      { exact: false, path: '/chat', component: '@/pages/chat/index' },
      // { exact: false, path: '/mobile/chat/:projectid', component: '@/pages/chat/mobile/index' },
      // { exact: false, path: '/mobile/chat', component: '@/pages/chat/mobile/index' },
      { path: '/editor/chatbot/turbo/:projectid', component: '@/pages/editors/chatbot/turbo/index' },
      { path: '/editor/chatbot/davinaci/:projectid', component: '@/pages/editors/chatbot/davinaci/index' },
      { path: '/editor/graph/:type/:projectid', component: '@/pages/graph/index' },
      {
        path: '/',
        component: '@/layouts/basic/index',
        routes: [
          { path: '/', redirect: '/store' },
          { path: '/home', component: '@/pages/home/index' },
          { path: '/store', component: '@/pages/store/index' },
          { path: '/project', component: '@/pages/project/index' },
          { path: '/dashboard', component: '@/pages/dashboard/index' },
          { path: '/template', component: '@/pages/template/index' },
          { path: '/apikeys', component: '@/pages/apiKeys/index' },
          { path: '/openai', component: '@/pages/openai/index' },
          { path: '/connect/:providerName/redirect', component: '@/pages/LoginRedirect' },
        ],
      },
    ],
  },

  { path: '/404', component: '@/pages/404' },
];
