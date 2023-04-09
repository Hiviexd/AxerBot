import { exec, ExecException } from "child_process";
import { codeBlock } from "discord.js";
import config from "../../config.json";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import generateWaitEmbed from "../../helpers/text/embeds/generateWaitEmbed";
import truncateString from "../../helpers/text/truncateString";
import { SlashCommand } from "../../models/commands/SlashCommand";
import { StatusManager } from "../../modules/status/StatusManager";
import MissingPermissions from "../../responses/embeds/MissingPermissions";

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
                        exec(`yarn`, (error, stdout, stderr) => {
                            if (error) return sendError(error);

                            command.followUp({
                                embeds: [
                                    generateSuccessEmbed("Updated modules"),
                                ],
                            });

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
                                                if (error)
                                                    return sendError(error);
                                            }
                                        );
                                    });
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
                        truncateString(
                            `${error.message}\n` + error.stack || error.message,
                            4096
                        )
                    )}`
                ),
            ],
        });
    }
});

export default rebuild;
