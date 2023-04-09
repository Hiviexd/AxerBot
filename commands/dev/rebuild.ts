import { SlashCommand } from "../../models/commands/SlashCommand";
import config from "../../config.json";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import { StatusManager } from "../../modules/status/StatusManager";
import { exec, ExecException } from "child_process";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { codeBlock } from "discord.js";
import generateWaitEmbed from "../../helpers/text/embeds/generateWaitEmbed";

const rebuild = new SlashCommand(
    "rebuild",
    "Shutdown and build axer again",
    "Developers",
    true
);

rebuild.builder.addStringOption((o) =>
    o.setName("reason").setDescription("reason to rebuild").setRequired(false)
);

rebuild.setExecuteFunction(async (command) => {
    if (!config.owners.includes(command.user.id))
        return command.editReply({
            embeds: [MissingPermissions],
        });

    const reason = command.options.getString("reason") || undefined;

    const status = new StatusManager();

    status
        .sendBuildMessage(reason, command.user)
        .then(() => {
            command
                .editReply({
                    embeds: [generateWaitEmbed("Build starting...")],
                })
                .then(executeBuild)
                .catch(executeBuild);
        })
        .catch(executeBuild);

    function executeBuild() {
        exec(
            `sudo -u ${process.env.LINUX_USER} git pull`,
            (error, stdout, stderr) => {
                if (error) return sendError(error);

                if (stdout.trim() == "Already up to date.")
                    return command.followUp({
                        embeds: [
                            generateWaitEmbed(stdout, "No need to build again"),
                        ],
                    });

                command
                    .followUp({
                        embeds: [generateSuccessEmbed(codeBlock(stdout))],
                    })
                    .then(() => {
                        exec(`tsc`, (error, stdout, stderr) => {
                            if (error) return sendError(error);

                            command
                                .followUp({
                                    embeds: [
                                        generateSuccessEmbed(
                                            "Build successful!"
                                        ),
                                    ],
                                })
                                .then(() => {
                                    exec(
                                        `pkill node`,
                                        (error, stdout, stderr) => {
                                            if (error) return sendError(error);
                                        }
                                    );
                                });
                        });
                    });
            }
        );
    }

    function sendError(error: ExecException) {
        command.followUp({
            content: `${command.user}`,
            embeds: [
                generateErrorEmbed(
                    `${codeBlock(
                        `${error.message}\n` + error.stack || error.message
                    )}`
                ),
            ],
        });
    }
});

export default rebuild;
