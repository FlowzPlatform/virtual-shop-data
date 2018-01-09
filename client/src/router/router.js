import Main from '@/views/Main.vue';

export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录'
    },
    component: resolve => { require(['@/views/login.vue'], resolve); }
};

export const page404 = {
  path: '/*',
  name: 'error-404',
  meta: {
      title: '404-页面不存在'
  },
  component: resolve => { require(['@/views/error-page/404.vue'], resolve); }
};

export const page403 = {
  path: '/403',
  meta: {
      title: '403-权限不足'
  },
  name: 'error-403',
  component: resolve => { require(['@//views/error-page/403.vue'], resolve); }
};

export const page500 = {
  path: '/500',
  meta: {
      title: '500-服务端错误'
  },
  name: 'error-500',
  component: resolve => { require(['@/views/error-page/500.vue'], resolve); }
};

export const otherRouter = {
  path: '/',
  name: 'otherRouter',
  redirect: '/home',
  component: Main,
  children: [
    { path: 'home', title: {i18n: 'home'}, name: 'home_index', component: resolve => { require(['@/views/home/home.vue'], resolve); } }
  ]
};

export const appRouter = [
  {
    path: '/preview',
    name: 'preview',
    title: 'preview',
    component: Main,
    children: [
      { path: 'index', title: 'preview', name: 'access_index', component: resolve => { require(['@/views/preview/preview.vue'], resolve); } }
    ]
  }
];

export const routers = [
  loginRouter,
  otherRouter,
  ...appRouter,
  page500,
  page403,
  page404
];
