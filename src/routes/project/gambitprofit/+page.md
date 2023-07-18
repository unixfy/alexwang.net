---
title: GambitProfit.com
image: gambitprofit.png
date: 12-23-2021
---

I built GambitProfit to make it easier for members of the community to use Gambit Rewards (i.e., eliminate the need to run numbers every day, and have an easy-to-use repository of historical games).

This site was my first real JAMStack application. Previously, I had only developed monolithic web applications -- first with WordPress, and then with Django. However, with Nuxt.js and Strapi CMS, I was able to quickly scale the site to meet the needs of my users (GambitProfit has had over 5 million total visits), while minimizing development time overhead -- important to me, as an unpaid one-man development team with other obligations! Nuxt.js also enabled me to develop this site very quickly; I built the entire site (including all features like Progressive Web App capability) in about 5 hours and 5000 lines of code. I also deployed the backend Strapi application on Amazon Elastic Container Service as a Docker container, and used AWS Lambda functions to handle extraneous (async) tasks like periodically scraping data from GambitRewards.