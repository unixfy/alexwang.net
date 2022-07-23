---
title: Authentik Auth Solution
image: authentik.jpg
date: 2021-05-30
---

With a growing number of applications and websites, I wanted to reduce the number of logins my users and I have to store, while enforcing multi-factor authentication (MFA) and increasing convenience. Initially, I deployed AD Federation Services (a natural choice as I was also using AD DS). However, AD FS turned to be extremely complicated for my small-scale deployment; it also didn't support MFA without third-party integrations.

After evaluating my options some more, I settled on Authentik in May 2021 -- around the time the project first started. It turned out to be the perfect solution: simple, easy, yet functional. I was able to set it up and integrate it with my AD DS in less than a day. Fantastic!

Since then, I've contributed multiple times to the Authentik open-source project, provided help to other users in the Authentik Discord server, and remained an Authentik user. Maybe I'm an Authentik fanatic (fanatik?). 🤷‍♀️

(See Authentik in action by trying to [log into my blog's WordPress admin page](https://blog.unixfy.net/wp-admin/)!)