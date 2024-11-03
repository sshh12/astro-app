import { lazy } from "react";

export const routes = {
  sky: {
    path: "/sky",
    Component: lazy(() => import("./pages/SkyPage")),
  },
  // skyList: {
  //   path: '/sky/list/:id',
  //   Component: lazy(() => import('./pages/SkyListPage')),
  // },
  // skyObject: {
  //   path: '/sky/object/:id',
  //   Component: lazy(() => import('./pages/SkyObjectPage')),
  // },
  // skySearch: {
  //   path: '/sky/search',
  //   Component: lazy(() => import('./pages/SkySearchPage')),
  // },
  // imageAnalyze: {
  //   path: '/image/analyze',
  //   Component: lazy(() => import('./pages/ImageAnalyzePage')),
  // },
  // imageImages: {
  //   path: '/image/images/:id',
  //   Component: lazy(() => import('./pages/ImageImagePage')),
  // },
  // imageEquipment: {
  //   path: '/image/equipment',
  //   Component: lazy(() => import('./pages/ImageEquipmentPage')),
  // },
  // imageNina: {
  //   path: '/image/nina',
  //   Component: lazy(() => import('./pages/ImageNinaPage')),
  // },
  // locationWeather: {
  //   path: '/location/weather',
  //   Component: lazy(() => import('./pages/LocationWeatherPage')),
  // },
  // locationPollution: {
  //   path: '/location/pollution',
  //   Component: lazy(() => import('./pages/LocationPollutionPage')),
  // },
  // locationEvents: {
  //   path: '/location/events',
  //   Component: lazy(() => import('./pages/LocationEventsPage')),
  // },
  // profile: {
  //   path: '/profile',
  //   Component: lazy(() => import('./pages/ProfilePage')),
  // },
  onboarding: {
    path: "/onboarding",
    Component: lazy(() => import("./pages/Onboarding")),
  },
  // tutorial: {
  //   path: '/tutorial',
  //   Component: lazy(() => import('./pages/Tutorial')),
  // },
};
