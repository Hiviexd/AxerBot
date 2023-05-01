import {
    EmbedBuilder,
    GuildMemberRoleManager,
    ButtonInteraction,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    InteractionCollector,
    StringSelectMenuInteraction,
} from "discord.js";
import colors from "../../constants/colors";
import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
import { selectRoles } from "../../database";

export async function handleSelectRoles(button: ButtonInteraction) {
    try {
        const idFields = button.customId.split(",");

        if (idFields[1] != "selectroles" || !button.member) return;

        await button.deferUpdate();

        const selectRolesMessageData = await selectRoles.findOne({
            _id: button.message.id,
            guild_id: button.guildId,
            channel: button.channelId,
        });

        if (!selectRolesMessageData)
            return button.followUp({
                embeds: [generateErrorEmbed("Something went wrong...")],
                ephemeral: true,
            });

        const roleManager = button.member.roles as GuildMemberRoleManager;

        const currentRolesMenu = new StringSelectMenuBuilder()
            .setOptions(
                selectRolesMessageData.roles.map((roleId) => {
                    const role = button.guild?.roles.cache.get(roleId);

                    if (role)
                        return {
                            label: `@${role.name}`,
                            value: roleId,
                            default: roleManager.cache.has(roleId),
                        };

                    return {
                        label: "@Unknwon Role",
                        value: roleId,
                    };
                })
            )
            .setMinValues(0)
            .setMaxValues(selectRolesMessageData.roles.length)
            .setCustomId(idFields[0]);

        button.followUp({
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                    currentRolesMenu
                ),
            ],
            ephemeral: true,
        });

        const collector = new InteractionCollector(button.client, {
            filter: (i) =>
                i.user.id == button.user.id && i.customId == idFields[0],
            time: 300000,
        });

        collector.on("collect", handleCollect);

        async function handleCollect(menu: StringSelectMenuInteraction) {
            if (!selectRolesMessageData) return;

            await menu.deferUpdate();

            const rolesToAdd = menu.values;
            const rolesToRemove = selectRolesMessageData.roles.filter(
                (r) => !menu.values.includes(r)
            );
            const managedRoles = [] as { added: boolean; name: string }[];

            for (const roleId of rolesToAdd) {
                try {
                    if (!roleManager.cache.has(roleId)) {
                        await roleManager.add(roleId);

                        managedRoles.push({
                            added: true,
                            name:
                                button.guild?.roles.cache.get(roleId)?.name ||
                                "Unknown Role",
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            for (const roleId of rolesToRemove) {
                try {
                    if (roleManager.cache.has(roleId)) {
                        await roleManager.remove(roleId);

                        managedRoles.push({
                            added: false,
                            name:
                                button.guild?.roles.cache.get(roleId)?.name ||
                                "Unknown Role",
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            const embed = new EmbedBuilder()
                .setTitle("📝 Roles updated!")
                .setDescription(
                    `\`\`\`diff\n${
                        managedRoles.length == 0
                            ? "None (Select again to remove/add)"
                            : managedRoles
                                  .map(
                                      (role) =>
                                          `${role.added ? "+" : "-"} @${
                                              role.name
                                          }`
                                  )
                                  .join("\n")
                    }\`\`\``
                )
                .setColor(colors.pink)
                .setFooter({
                    text: `Dismiss the messages above in order to re-use the role selector`,
                });

            collector.stop();

            button.followUp({
                embeds: [embed],
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error(error);

        (button.deferred || button.replied ? button.followUp : button.reply)({
            embeds: [generateErrorEmbed("Something went wrong!")],
            ephemeral: true,
        });
    }
}
