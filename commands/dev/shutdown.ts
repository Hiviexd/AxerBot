import { SlashCommand } from "../../models/commands/SlashCommand";
import config from "./../../config.json";
import MissingPermissions from "../../responses/embeds/MissingPermissions";
import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
import { StatusManager } from "../../modules/status/StatusManager";
import { CommandCategory } from "../../struct/commands/CommandCategory";

const shutdown = new SlashCommand()
    .setName("shutdown")
    .setDescription("Shutdown axer zzz")
    .setCategory(CommandCategory.Developers);

shutdown.setExecutable(async (command) => {
    if (!config.owners.includes(command.user.id))
        return command.editReply({
            embeds: [MissingPermissions],
        });

    const status = new StatusManager();

    status
        .sendOutageMessage("Shutdown", command.user)
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
    }
});

export default shutdown;
