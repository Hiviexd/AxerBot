import {
    CommandInteraction,
    MessageCollector,
    TextBasedChannel,
} from "discord.js";

export async function generateStepTextInput(
    command: CommandInteraction,
    deleteInput: boolean
) {
    interface IStepWithMenuPromise {
        reason: "timeout" | "resolve";
        data: string;
    }

    const promise: Promise<IStepWithMenuPromise> = new Promise(
        (resolve, reject) => {
            const collector = new MessageCollector(
                command.channel as TextBasedChannel,
                {
                    time: 60000,
                    filter: (i) => i.author.id == command.user.id,
                }
            );

            collector.on("collect", async (message) => {
                collector.stop("UserChoice");

                if (deleteInput) message.delete().catch(console.error);

                resolve({
                    reason: "resolve",
                    data: message.content,
                });
            });

            collector.on("end", (interactions, reason) => {
                if (reason != "UserChoice")
                    return reject({
                        reason: "timeout",
                        data: null,
                    });
            });
        }
    );

    return promise;
}
