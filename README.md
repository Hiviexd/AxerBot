# AxerBot

[![CodeFactor](https://www.codefactor.io/repository/github/axerbot/axer-bot/badge/main)](https://www.codefactor.io/repository/github/axerbot/axer-bot/overview/main) [![GitHub license](https://img.shields.io/github/license/AxerBot/axer-bot?color=blue)](https://github.com/AxerBot/axer-bot/blob/main/LICENSE) ![Lines of code](https://img.shields.io/tokei/lines/github/axerbot/axer-bot) ![GitHub last commit](https://img.shields.io/github/last-commit/axerbot/axer-bot)

A general-purpose and powerful Discord bot with osu! features related to mapping & modding

## [invite link]( https://discord.com/api/oauth2/authorize?client_id=937807478429745213&permissions=1256748215504&scope=bot%20applications.commands)

# About

This bot contains many features that makes your life easier as an osu! Discord server owner, moderdator or member, including:

- Message purging
- Sending messages as the bot user
- A configurable quote responses system
- command cooldowns
- A message logging system
- A reminder system
- A bunch of of fun and trivial commands

The bot also interacts with osu!'s API v2 and [the BN/NAT Management website](https://bn.mappersguild.com/)'s interOp routes to provide you with multiple stats and management systems such as:

- An OAuth2 verification system where you sign up with your osu! account in order to be granted access to the server.
- Several commands that allow you to view your playing/mapping stats from the osu! website or the BN/NAT website.

# Usage (for regular users)

- invite the bot.
- type `-help` to see a list of all available commands; Use `-help <command>` to see how a specific command works.
- if the `-` prefix doesn't suit you, feel free to change it via the `-setprefix` command.

from this step onwards, you can set up any of these following systems as a server owner/manager:

- The osu! verification system
- The logging channel
- The quotes system
- The command cooldowns system

# Contributing

## **Before starting to work on things for this project, please open an issue that describes what you're workning on, and wait for approval from one of the main devs!**

If you want to contribute to this project, please read the following to learn how to set up a local instance of the bot, and [read this](./commands/README.md) to learn more about the command structure of the bot:

## Prerequisites

- A Discord bot user
- Node v17
- npm
- discord.js
- TypeScript
- ts-node
- MongoDB
- an osu! API v2 client
- (optional) BN site interOp access
- sudo access if you're on linux

## Installation

- Clone the repository
- `npm i`
- Set up config.json
- Set up `.env` file starting from the `.envexample` file
- `ts-node .` (use sudo if you're on linux)

## Thanks to

- **[Sebola3461](https://github.com/Sebola3461)** for helping me a lot with this project!
- **[pishifat](https://github.com/pishifat)** for granting me access to BN site's interOp routes.
