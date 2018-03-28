import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    
    meta: {
        title: 'Login'
    },
    component: resolve => { require(['@/views/login.vue'], resolve); }
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-Not Found'
    },
    component: resolve => { require(['@/views/error-page/404.vue'], resolve); }
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-forbidden'
    },
    name: 'error-403 Unauthorized request',
    component: resolve => { require(['@//views/error-page/403.vue'], resolve); }
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-general Error'
    },
    name: 'error-500',
    component: resolve => { require(['@/views/error-page/500.vue'], resolve); }
};

export const preview = {
    path: '/preview',
    name: 'preview',
    component: resolve => { require(['@/views/form/article-publish/preview.vue'], resolve); }
};

export const locking = {
    path: '/locking',
    name: 'locking',
    component: resolve => { require(['@/views/main-components/lockscreen/components/locking-page.vue'], resolve); }
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        { path: 'home', title: 'Dashboard', name: 'Dashboard', component: resolve => { require(['@/views/home/home.vue'], resolve); } },
        { path: 'vshoplist', title: 'Virtual Shop List', name: 'Virtual Shop List', component: resolve => { require(['@/views/home/vshoplist.vue'], resolve); } }
    ]
};

// Main
export const appRouter = [
      {
        path: '/',
        icon: 'monitor',
        title: 'Dashboard',
        component: Main,
        children: [
            {   path: 'home',
                name: 'Dashboard',
                title: 'Dashboard',
                component: resolve => { require(['@/views/home/home.vue'], resolve); } 
            }
        ]
    },
    {
        path: '/',
        icon: 'android-list',
        title: 'Virtual Shop List',
        component: Main,
        children: [
            {   path: 'vshoplist', 
                name: 'Virtual Shop List', 
                title: 'Virtual Shop List',
                component: resolve => { require(['@/views/home/vshoplist.vue'], resolve); } 
            }
        ]
    }
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    preview,
    locking,
    ...appRouter,
    page500,
    page403,
    page404
];
