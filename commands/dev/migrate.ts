// import { DatabaseMigrations } from "../../database/migrations";
// import generateErrorEmbed from "../../helpers/text/embeds/generateErrorEmbed";
// import generateSuccessEmbed from "../../helpers/text/embeds/generateSuccessEmbed";
// import { SlashCommand } from "../../models/commands/SlashCommand";
// import MissingPermissions from "../../responses/embeds/MissingPermissions";
// import config from "./../../config.json";

// const migrate = new SlashCommand(
//     "migrate",
//     "Run database migration with target",
//     "Developers",
//     true
// );

// migrate.builder.addStringOption((o) =>
//     o.setName("id").setDescription("Migration name").setRequired(true)
// );

// migrate.setExecuteFunction(async (command) => {
//     if (!config.owners.includes(command.user.id))
//         return command.editReply({
//             embeds: [MissingPermissions],
//         });

//     const id = command.options.getString("id", true);

//     const targetMigration = DatabaseMigrations.find((m) => m.name == id);

//     if (!targetMigration)
//         return command.editReply({
//             embeds: [generateErrorEmbed("Migration not found!")],
//         });

//     try {
//         await targetMigration.run(command);

//         command.editReply({
//             embeds: [generateSuccessEmbed("Migration done!")],
//         });
//     } catch (e: any) {
//         console.error(e);

//         command.editReply({
//             embeds: [
//                 generateErrorEmbed(
//                     e.message || "Something went wrong! Check console."
//                 ),
//             ],
//         });
//     }
// });

// export default migrate;
