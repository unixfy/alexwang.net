---
title: GambitProfit Rewrite
image: gambitprofit-rewrite.png
date: 07-29-2022
---

The previous version of GambitProfit used Nuxt.js for the frontend and Strapi CMS for the backend. However, since I created that version, I've discovered the joys of Svelte and Django for frontend and backend, respectively. So, I decided to rewrite GambitProfit using those technologies while resolving lingering quality of life issues created by Strapi's limitations, such as its inability to handle the complex nested data structure I wanted.

I constructed the frontend using Svelte, Tailwind, and Daisy UI, while migrating all existing functionality from the Nuxt.js version (including persistent settings, dark mode, etc.). The frontend fetches data from the backend API using Svelte's endpoints. As an improvement over the previous version, the Svelte-based frontend has dedicated pages for every game in the API that displays more detailed data on each game that many users asked for.

The backend is built on Django with Django-rest-framework. The gambitrewards.com scraper is built into the Django app (as a Django Q async task) rather than being a separate AWS Lambda function, reducing my development overhead. Using Django rather than a prebuilt CMS solution like Strapi means I can implement more complex data models (particularly with relations, which Strapi didn't support very well). It also means I can build functionality to adjust settings for bet calculation on the fly, with no need to edit configuration files and restart the API server.

Overall, the rewritten GambitProfit delivers a better experience both for the user and the developer. A win-win!