import crypto from "crypto";
import {
    ActionRowBuilder,
    EmbedBuilder,
    GuildResolvable,
    InteractionCollector,
    InteractionType,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextChannelResolvable,
} from "discord.js";

import colors from "../../constants/colors";
import { countryCodes } from "../../constants/countrycodes";
import { randomizeArray } from "../../helpers/transform/randomizeArray";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { CountryCodes } from "../../types/flags";

const guesstheflag = new SlashCommand(
    ["guesstheflag", "gtf"],
    'A fun "Guess the Flag" minigame!',
    "Fun",
    true
);

const blacklist = [
    "Alaska",
    "Alabama",
    "Arkansas",
    "Arizona",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Iowa",
    "Idaho",
    "Illinois",
    "Indiana",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Massachusetts",
    "Maryland",
    "Maine",
    "Michigan",
    "Minnesota",
    "Missouri",
    "Mississippi",
    "Montana",
    "North Carolina",
    "North Dakota",
    "Nebraska",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "Nevada",
    "New York",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Virginia",
    "Vermont",
    "Washington",
    "Wisconsin",
    "West Virginia",
    "Wyoming",
];

guesstheflag.setExecuteFunction(async (command) => {
    const codes = countryCodes;

    let score = 0;
    let lifes = 5;
    let turn = getRandomFlag();
    const gameData = JSON.stringify({
        user: command.user.id,
        id: crypto.randomBytes(10).toString("hex"),
    });

    function getRandomFlag() {
        const code =
            Object.keys(codes)[
                Math.floor(Math.random() * Object.keys(codes).length)
            ];

        const name = countryCodes[code];

        return {
            code,
            name,
        };
    }

    function getSelectMenuFor(currentTurn: string) {
        let randomizedCodes = randomizeArray<keyof CountryCodes>(
            Object.keys(codes)
        ).filter((c) => c != currentTurn);

        randomizedCodes = randomizedCodes.slice(0, 4);
        randomizedCodes.push(currentTurn);
        randomizedCodes = randomizeArray(randomizedCodes);

        const selectMenu = new StringSelectMenuBuilder()
            .setPlaceholder("Select country")
            .setCustomId(gameData)
            .setOptions(
                randomizedCodes.map((code) => {
                    return {
                        label: codes[code],
                        value: code as string,
                    };
                })
            );

        return selectMenu;
    }

    function wrongAnswerEmbed(answer: string) {
        const embed = new EmbedBuilder()
            .setTitle(`Wrong answer!`)
            .setDescription(
                `You lost 1 life and you have \`${lifes}\` lifes now. The correct answer is \`${answer}\``
            )
            .setColor(colors.red);

        return embed;
    }

    function rightAnswerEmbed(score: number, lifes: number) {
        const embed = new EmbedBuilder()
            .setTitle(`Correct answer!`)
            .setDescription(`Next game will start in 5 seconds...`)
            .setColor(colors.green)
            .addFields(
                {
                    name: "Score",
                    value: `\`${score}\` points`,
                    inline: true,
                },
                {
                    name: "Lifes",
                    value: `\`${lifes}\``,
                    inline: true,
                }
            );

        return embed;
    }

    function sendGameOver() {
        const embed = new EmbedBuilder()
            .setTitle(`Game over!`)
            .setDescription(
                `You lost all your lifes. Your final score is \`${score}\` points`
            )
            .setColor(colors.red);

        command.editReply({
            components: [],
            embeds: [embed],
        });
    }

    function sendGame() {
        turn = getRandomFlag();

        const embed = new EmbedBuilder()
            .setTitle("🌍 Guess the flag")
            .setImage(`https://flagcdn.com/w320/${turn.code}.png`)
            .setDescription("What's the name of this flag country?")
            .setColor(colors.yellow);

        return command
            .editReply({
                components: [
                    new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                        getSelectMenuFor(turn.code)
                    ),
                ],
                embeds: [embed],
            })
            .then(() => {
                createCollector();
            });
    }

    function createCollector() {
        const collector = new InteractionCollector(command.client, {
            channel: command.channel as TextChannelResolvable,
            guild: command.guild as GuildResolvable,
            filter: (i) => i.user.id == command.user.id,
        });

        collector.on("collect", (select: StringSelectMenuInteraction) => {
            if (select.type != InteractionType.MessageComponent) return;
            if (select.customId != gameData) return;
            select.deferUpdate();
            collector.stop();

            if (select.values[0] != turn.code) {
                lifes -= 1;

                if (lifes == 0) return sendGameOver();

                command
                    .editReply({
                        components: [],
                        embeds: [wrongAnswerEmbed(turn.name)],
                    })
                    .then(() => {
                        setTimeout(() => {
                            sendGame();
                        }, 5000);
                    });
            } else {
                score += 1;
                command
                    .editReply({
                        components: [],
                        embeds: [rightAnswerEmbed(score, lifes)],
                    })
                    .then(() => {
                        setTimeout(() => {
                            sendGame();
                        }, 5000);
                    });
            }
        });
    }

    sendGame();
});

export default guesstheflag;
