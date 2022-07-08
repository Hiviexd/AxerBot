# Commands (THIS IS OUTDATED DO NOT README LITERALLY EVERYTHNG HAS CHANGED WITH THE SLASH COMMAND MIGRATION)

Below is a guide on how do commands work in this project.

# For users

Simply run `-help` to see a list of all available commands; Use `-help <command>` to see how a specific command works.

# For developers

The command handler is pretty dynamic and adaptive, which makes developing commands very easy.

## Basic structure

- To create a new category, create a new folder here.

- To create a new command, go to a category, and create a `commandName.ts` file.

1. Create your exports, which include:
    - **name**: name of the command
    - **help**: the `help` command's fields, you should usually set up a description, syntax, and example.
    - **category**: name of the category the command is in
    - **run**: the function that will be run when the command is called
2. after finishing the command, index it in `index.ts` so the command handler recognizes it.

Please check out [`yesno.ts`](./fun/yesno.ts) and [`ping.ts`](./misc/ping.ts) for basic command examples.

## Subcommands

- You can create subcommands by creating a `./subcommands/<commandName>` folder in the category folder where your command resides.

- In the `subcommandName.ts` file, you simply adjust your exports by removing **category** and adding **trigger** instead, which contains the word that triggers the subcommand.

- To import subcommands, add the following import to your main command's exports:
`subcommands: [subcommandName1, subcommandName2, ...]`

Please check out [`verification.ts`](./management/verification.ts) and [verification subcommands](./management/subcommands/verification/) to see how a command with subcommands is handled.

## Helpers, modules, responses, and types

The command handler is built on top of a few different things:

### **Helpers**

Functions that are used by the bot/commands to aid with their work, avoid cluttering the command file with too many functions, and make functions re-usable.

Helpers contain text-related functions, command-related functions, and API fetchers/handlers.

When developing, it's recommend to check the helper folder for functions that can possibly aid you while developing this bot, else feel free to make some!

### **Modules**

Modules that are used by commands to run continuous systems, check current modules to better understand what I'm talking about.

### **Responses**

Functions that generate multiple responses (mainly embeds) to send to the user.

### **Types**

Mainly used for assigning types to API responses.

You basically have to structure your work around these in order to contribute to the project, so please snoop around the code to see how it works.
