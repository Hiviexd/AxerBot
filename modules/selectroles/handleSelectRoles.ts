import {
    EmbedBuilder,
    GuildMemberRoleManager,
    StringSelectMenuInteraction,
} from "discord.js";
import colors from "../../constants/colors";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";

export async function handleSelectRoles(
    selectMenu: StringSelectMenuInteraction
) {
    try {
        const idFields = selectMenu.customId.split(",");

        console.log(idFields);

        if (idFields[1] != "selectroles" || !selectMenu.member) return;

        selectMenu.deferUpdate();

        const rolesToManage = selectMenu.values;

        const managedRoles = [] as { added: boolean; name: string }[];
        const roleManager = selectMenu.member.roles as GuildMemberRoleManager;

        for (const roleId of rolesToManage) {
            try {
                if (roleManager.cache.has(roleId)) {
                    await roleManager.remove(roleId);

                    managedRoles.push({
                        added: false,
                        name:
                            selectMenu.guild?.roles.cache.get(roleId)?.name ||
                            "Unknown Role",
                    });
                } else {
                    await roleManager.add(roleId);

                    managedRoles.push({
                        added: true,
                        name:
                            selectMenu.guild?.roles.cache.get(roleId)?.name ||
                            "Unknown Role",
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        if (managedRoles.length == 0)
            return selectMenu.followUp({
                embeds: [generateErrorEmbed("Something went wrong!")],
                ephemeral: true,
            });

        const embed = new EmbedBuilder()
            .setTitle("📝 Roles managed")
            .setDescription(
                `\`\`\`diff\n${managedRoles
                    .map((role) => `${role.added ? "+" : "-"} @${role.name}`)
                    .join("\n")}\`\`\``
            )
            .setColor(colors.pink);

        selectMenu.followUp({
            embeds: [embed],
            ephemeral: true,
        });
    } catch (error) {
        console.error(error);

        selectMenu.followUp({
            embeds: [generateErrorEmbed("Something went wrong!")],
            ephemeral: true,
        });
    }
}
