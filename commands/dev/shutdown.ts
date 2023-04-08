import { SlashCommand } from "../../models/commands/SlashCommand";
import config from "./../../config.json";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import { StatusManager } from "../../modules/status/StatusManager";

const shutdown = new SlashCommand(
    "shutdown",
    "Shutdown axer",
    "Developers",
    true
);

shutdown.builder.addStringOption((o) =>
    o.setName("reason").setDescription("reason to shutdown").setRequired(false)
);

shutdown.setExecuteFunction(async (command) => {
    if (!config.owners.includes(command.user.id))
        return command.editReply({
            embeds: [MissingPermissions],
        });

    const reason = command.options.getString("reason") || undefined;

    const status = new StatusManager();

    status
        .sendOutageMessage(reason, command.user)
        .then(() => {
            command
                .editReply({
                    embeds: [generateSuccessEmbed("Done!")],
                })
                .then(() => executeShutdown)
                .catch(() => executeShutdown);
        })
        .catch(executeShutdown);

    function executeShutdown() {
        command.client.destroy();
        process.exit(1);
    }
});

export default shutdown;
