import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildResolvable,
    InteractionCollector,
    TextBasedChannelResolvable,
} from "discord.js";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { SlashCommand } from "../../models/commands/SlashCommand";
import abbreviation from "../../helpers/text/abbreviation";
import colors from "../../constants/colors";

const rps = new SlashCommand(
    "rps",
    "Play a rock paper scissors game!",
    "Fun",
    false
);

rps.builder.addUserOption((o) =>
    o
        .setName("opponent")
        .setDescription("Your fight opponent")
        .setRequired(true)
);

rps.setExecuteFunction(async (command) => {
    const opponent = command.options.getUser("opponent", true);

    if (opponent.bot)
        return command.editReply({
            embeds: [generateErrorEmbed("You can't play with bots...")],
        });

    interface IRpsChoice {
        user: string;
        choice: string;
    }

    let playerTurnId = command.user.id;
    let results: IRpsChoice[] = [];

    const embed = new EmbedBuilder()
        .setTitle(`🎮 ${command.user.username} vs ${opponent.username}`)
        .setDescription(`${abbreviation(command.user.username)} turn!`)
        .setColor(colors.yellowBright);

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>();

    buttonsRow.addComponents(
        new ButtonBuilder({
            label: "🪨",
            style: ButtonStyle.Primary,
            customId: "rps,rock",
        }),
        new ButtonBuilder({
            label: "📄",
            style: ButtonStyle.Primary,
            customId: "rps,paper",
        }),
        new ButtonBuilder({
            label: "✂️",
            style: ButtonStyle.Primary,
            customId: "rps,scissors",
        })
    );

    const collector = new InteractionCollector(command.client, {
        channel: command.channel as TextBasedChannelResolvable,
        guild: command.guild as GuildResolvable,
        filter: (i) => [command.user.id, opponent.id].includes(i.user.id),
    });

    collector.on("collect", (button) => {
        const targets = button.customId.split(",");

        if (![command.user.id, opponent.id].includes(button.user.id)) {
            button.reply({
                content: "Get out! You're not in this game.",
                ephemeral: true,
            });

            return;
        }

        if (targets[0] != "rps") return;

        if (playerTurnId != button.user.id) {
            button.reply({
                content: "Chill bro, isn't your turn...",
                ephemeral: true,
            });

            return;
        }

        if (results.find((c) => c.user == playerTurnId)) {
            button.reply({
                content: "Chill bro, you already selected...",
                ephemeral: true,
            });

            return;
        }

        button.deferUpdate();

        results.push({ user: button.user.id, choice: targets[1] });

        setTurn();

        if (results.length == 2) {
            getResult(results[0], results[1]);
        }
    });

    function setTurn() {
        playerTurnId = opponent.id;

        embed.setDescription(`${abbreviation(opponent.username)} turn!`);

        command.editReply({
            embeds: [embed],
        });
    }

    function sendResult(text: string) {
        embed.setDescription(text);

        collector.stop();

        return command.editReply({
            content: `<@${playerTurnId}>`,
            embeds: [embed],
            components: [],
        });
    }

    function getResult(user: IRpsChoice, opponent: IRpsChoice) {
        const values: { [key: string]: number } = {
            rock: 0,
            paper: 1,
            scissors: 2,
        };

        const emojis = ["🪨", "📄", "✂️"];

        if (user.choice == opponent.choice) return sendResult(`Tie!`);

        if (
            ((values[user.choice] | (1 << 2)) -
                (values[opponent.choice] | (0 << 2))) %
            3
        ) {
            return sendResult(
                `<@${user.user}> Won with ${emojis[values[user.choice]]} vs ${
                    emojis[values[opponent.choice]]
                }!`
            );
        }

        return sendResult(
            `<@${opponent.user}> Won with ${
                emojis[values[opponent.choice]]
            } vs ${emojis[values[user.choice]]}!`
        );
    }

    return command.editReply({
        content: `<@${opponent.id}>`,
        embeds: [embed],
        components: [buttonsRow],
        allowedMentions: {
            users: [opponent.id],
        },
    });
});

export default rps;
