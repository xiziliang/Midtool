import { createRouter, createWebHistory, RouteLocationNormalized, type RouteRecordRaw } from 'vue-router';

export const $routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/home.vue'),
    redirect: { name: 'NovelAI' },
    meta: {
      title: '首页',
    },
    children: [
      {
        path: 'NovelAI',
        name: 'NovelAI',
        component: () => import('@/views/novelAi/novelAi.vue'),
        meta: {
          title: 'NovelAi',
        }
      },
      {
        path: 'midjourney',
        name: 'midjourney',
        component: () => import('@/views/midJourney/midJourney.vue'),
        meta: {
          title: 'midjourney',
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
