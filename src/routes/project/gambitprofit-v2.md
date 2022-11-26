---
title: GambitProfit v2
image: gambitprofit-v2.png
date: 07-29-2022
---

Although the first iteration of GambitProfit, built on Strapi, was easy to build and deploy, it stood in the way of scaling the site according to my vision. For example, Strapi wasn't able to handle the complex nested data structure I wanted.

On the other hand, I already had experience with Django from a past project. Also, my Strapi install was using MongoDB, support for which had been eliminated in a version of Strapi released after I developed GambitProfit's first version. So, to ensure the site's continued viability, I rewrote the entire API from the ground up using Django and Django-REST-Framework. Besides offering much more flexibility than Strapi, my Django-based application is easier to maintain, more developer-friendly, and faster.

In addition to the backend rewrite, I also wanted to move from NuxtJS to my preferred framework, Svelte, for the frontend. So, I also rewrote that from the ground up, including implementing a custom API client and a brand-new, user- and mobile-friendly UI. Additionally, I implemented several long-desired features, such as dedicated pages for individual plays.

In general, the rewrite has enhanced the site's flexibility, and reduced my development effort.