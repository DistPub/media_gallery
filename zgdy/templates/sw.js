{% load static %}
importScripts('{% static "js/workbox/workbox-sw.js" %}');
workbox.setConfig({
  modulePathPrefix: '{% get_static_prefix %}js/workbox/'
});

const {registerRoute} = workbox.routing;
const {CacheFirst, NetworkFirst} = workbox.strategies;
const {CacheableResponsePlugin} = workbox.cacheableResponse;

const cdn = [
  'https://cdn.jsdelivr.net',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

registerRoute(
  ({url}) => cdn.includes(url.origin) === false,
  new NetworkFirst()
);

registerRoute(
  ({url}) => cdn.includes(url.origin),
  new CacheFirst({
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]})
    ],
  })
);
