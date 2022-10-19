import { createRouter, createWebHistory, RouteLocationNormalized, type RouteRecordRaw } from 'vue-router';

export const $routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/home.vue'),
    redirect: { name: 'novelAi' },
    meta: {
      title: '首页',
    },
    children: [
      {
        path: 'novelAi',
        name: 'novelAi',
        component: () => import('@/views/novelAi/novelAi.vue'),
        meta: {
          title: 'NovelAi',
        }
      },
      {
        path: 'midJourney',
        name: 'midJourney',
        component: () => import('@/views/midJourney/midJourney.vue'),
        meta: {
          title: 'MidJourney',
        }
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*', 
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
  }
];

export let $route: RouteLocationNormalized;

export const $router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: $routes,
});

$router.afterEach(to => {
  $route = to;
});
