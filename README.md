# AxerBot

[![CodeFactor](https://www.codefactor.io/repository/github/axerbot/axer-bot/badge/main)](https://www.codefactor.io/repository/github/axerbot/axer-bot/overview/main) [![GitHub license](https://img.shields.io/github/license/AxerBot/axer-bot?color=blue)](https://github.com/AxerBot/axer-bot/blob/main/LICENSE) ![Lines of code](https://img.shields.io/tokei/lines/github/axerbot/axer-bot) ![GitHub last commit](https://img.shields.io/github/last-commit/axerbot/axer-bot)

A general-purpose and powerful Discord bot with osu! features related to mapping & modding

- **[invite link](https://discord.com/api/oauth2/authorize?client_id=937807478429745213&permissions=1256748215504&scope=bot%20applications.commands)** (or run `/info` on a server the bot is in)
- **[Discord server](https://discord.gg/MAsnz96qGy)**: If you want to notified with all bot updates, or make bug reports/feature requests.

## About

This bot contains many features that makes your life easier as an osu! Discord server owner, moderator or member, including:

- Message purging
- Sending messages as the bot user
- A configurable quote responses system
- command cooldowns
- A message logging system
- A reminder system
- A bunch of fun and trivial commands
- Clickable osu! timestamps
<img src ="https://bns.are-la.me/992SNJv.png" width="488" />

- Automatic beatmap discussion and comment embeds
<img src ="https://bns.are-la.me/9H5nUmX.png" width="700" />

The bot also interacts with osu!'s API v2 and [the BN/NAT Management website](https://bn.mappersguild.com/)'s interOp routes to provide you with multiple stats and management systems such as:

- An OAuth2 verification system where you sign up with your osu! account in order to be granted access to the server, with usergroup-specific role assignments
<img src ="https://nats.are-la.me/1HzvzQs.png" />

- A feed system that actively keeps track of the request statuses for all BNs/NATs

<img src ="https://bns.are-la.me/5XHQimv.png" width="500" />

- Several commands that allow you to view your playing/mapping stats from the osu! website or the BN/NAT website
<img src ="https://nats.are-la.me/5s5Lj1w.png" width="800" />

## Thanks to

- **[Sebola3461](https://github.com/Sebola3461)** for helping me a lot with this project!
- **[pishifat](https://github.com/pishifat)** for granting me access to BN site's interOp routes.

## Usage

- invite the bot.
- type `-help` to see a list of all available commands; Use `-help <command>` to see how a specific command works.
- if the `-` prefix doesn't suit you, feel free to change it via the `-setprefix` command.

from this step onwards, you can set up any of these following systems as a server owner/manager:

- The osu! verification system
- The logging channel
- The quotes system
- The command cooldowns system

## Contributing

**Before starting to work on things for this project, please open an issue that describes what you're working on, and wait for approval from one of the main devs!**

If you want to contribute to this project, please read the following to learn how to set up a local instance of the bot, and [read this](./commands/README.md) to learn more about the command structure of the bot:

### Prerequisites

- A Discord bot user
- Node v17
- yarn
- MongoDB
- an osu! API v2 client
- (optional) BN site interOp access

### Installation

- Clone the repository
- `yarn`
- Set up `config.json`
- Set up `.env` file starting from the `.env.example` file
  - `TOKEN`: bot's token
  - `CLIENT_ID`: bot's client ID
  - `OSU_CLIENT_ID`: osu! API v2 client ID
  - `OSU_CLIENT_SECRET`: osu! API v2 client secret
  - `PORT`: port, default is 3000
  - `MONGO_USER`: MongoDB username
  - `MONGO_PASSWORD`: MongoDB password
  - `MONGO_DB`: mongoDB database name
  - `MONGO_CLUSTER`: mongoDB cluster name
  - `QAT_USER`: BN site interOp username[^optional-bnsite]
  - `QAT_SECRET`: BN site interOp secret[^optional-bnsite]
  - `OSU_USERNAME`: your osu! username[^optional-beatmaps]
  - `OSU_PASSWORD`: your osu! password[^optional-beatmaps]
- `yarn dev`

[^optional-bnsite]: These are optional, but without those, all BN site-related functionality won't work (BN commands/tracking).
[^optional-beatmaps]: These are optional, but without those, the "Download" button on beatmap embeds won't work.
