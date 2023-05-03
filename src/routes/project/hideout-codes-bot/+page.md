---
title: Hideout Codes Bot
image: hideout-codes-bot.jpg
date: 2020-11-24
---
This bot automatically scrapes Facebook for promo codes for Hideout.TV. I created this bot to make it easier for Hideout users in the communities I'm in to redeem the promo codes in time.

Initially, I used Huginn to scrape using Facebook's API and then send each detected code to a Discord webhook to be posted a message in a Discord server (I have a [blog post](https://blog.unixfy.net/hideout-tv-codes-bot/) that details how the first version of the Hideout bot was created).

After Facebook dramatically tightened restrictions on its API due to the Cambridge Analytica scandal, I had to rewrite the bot from scratch in Python. This time, the bot used Selenium and a residential proxy to automatically load Hideout's Facebook page every few minutes and parse the latest post for codes. Unfortunately, residential proxies are very expensive so I had to shut down the bot after some time. 🙁