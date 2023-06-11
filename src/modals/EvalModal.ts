import {Modal, Bot, CommandPermissions} from "../classes/Bot";
import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import Utils from "../classes/Utils";
import util from 'util';

export default class extends Modal {
    private async clean (text: unknown): Promise<string> {
        if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
        else return String(text);
    }
    private async asyncEvaled (code: string, interaction: ModalSubmitInteraction, split: boolean): Promise<void> {
        try {
            let asyncEvaled = '⚠️ Failed to set async return value.';
            await eval(`(async () => { ${code} } )().then(p => asyncEvaled = p);`);
            if (asyncEvaled === undefined) asyncEvaled = '⚠️ No return value.';
            if (typeof asyncEvaled !== 'string') asyncEvaled = util.inspect(asyncEvaled, false, 0, false);
            if (split) {
                for (const m of Utils.splitMessage('```js\n'+await this.clean(asyncEvaled)+'\n```', { char: '/\n|./', prepend: '```js\n', append: '```' })) {
                    await interaction.editReply(m);
                }
                return;
            } else {
                interaction.editReply('```js\n'+await this.clean(asyncEvaled)+'\n```').catch((e: any) => {
                    void interaction.editReply('⚠️ AsyncOutput is too long, check console for details! (or use `split` flag)');
                    console.info(`[ASYNCEVAL_STDOUT] ${asyncEvaled}`);
                });
                return;
            }
        } catch(e) {
            const err = e as Error;
            if (split) {
                for (const m of Utils.splitMessage(`:bangbang::x: **AsyncError:**\n\`\`\`js\n${await this.clean(err)}\n\`\`\``, {
                    char: '/\n|./',
                    prepend: '```js\n',
                    append: '```'
                })) {
                    await interaction.editReply(m)
                }
                return;
            } else {
                interaction.editReply(`:bangbang::x: **AsyncError:**\n\`\`\`js\n${await this.clean(err)}\n\`\`\``).catch((e: any) => {
                    void interaction.editReply('⚠️ AsyncError is too long, check console for details! (or use `split` flag)');
                    console.info(`[ASYNCEVAL_STDERR] ${err.toString()}`);
                });
                return;
            }
        }
    }
    override async run(interaction: ModalSubmitInteraction, bot: Bot): Promise<void> {
        const flags = interaction.fields.getTextInputValue('flagsInput');
        const code = interaction.fields.getTextInputValue('codeInput');
        const ephemeral: boolean = flags.includes('ephemeral');
        await interaction.deferReply({ephemeral: ephemeral});
        if (interaction.user.id !== process.env.OWNER_ID) {
            await interaction.editReply({
                content: "No"
            });
            return;
        }
        const split: boolean = flags.includes('split');
        const async: boolean = flags.includes('async');

        if (!code) {
            await interaction.editReply({
                content: "No code provided"
            });
            return;
        }

        if (async) {
            await this.asyncEvaled(code, interaction, split);
            return;
        }

        try {
            let evaled: unknown = eval(code);
            if (evaled instanceof Promise) {
                evaled = util.inspect(evaled, false, 0, false);
                if ((<string>evaled).includes('<pending>') || (<string>evaled).includes('{ undefined }')) return;
            }
            if (typeof evaled !== 'string') evaled = util.inspect(evaled, false, 0, false);

            if (split) {
                for (const m of Utils.splitMessage('```js\n'+await this.clean(evaled)+'\n```', { char: '/\n|./', prepend: '```js\n', append: '```' })) {
                    await interaction.editReply(m);
                }
                return;
            } else {
                interaction.editReply('```js\n'+await this.clean(evaled)+'\n```').catch((e: any) => {
                    void interaction.editReply('⚠️ Output is too long, check console for details! (or use `split` flag)');
                    return console.info(`[EVAL_STDOUT] ${evaled as string}`);
                });
                return;
            }
        } catch (err) {
            if (split) {
                for (const m of Utils.splitMessage(`:bangbang::x: **Error:**\n\`\`\`js\n${await this.clean(err)}\n\`\`\``, { char: '/\n|./', prepend: '```js\n', append: '```' })) {
                    await interaction.editReply(m);
                }
                return;
            } else {
                interaction.editReply(`:bangbang::x: **Error:**\n\`\`\`js\n${await this.clean(err)}\n\`\`\``).catch((e: any) => {
                    void interaction.editReply('⚠️ Error is too long, check console for details! (or use `split` flag)');
                    return console.info(`[EVAL_STDERR] ${err as string}`);
                });
                return;
            }
        }
    }

    override name(): string {
        return "Paste your eval code here";
    }

    override id(): string {
        return "eval";
    }

    override async build(args: string[]): Promise<ModalBuilder> {
        return new ModalBuilder()
            .setCustomId(this.id())
            .setTitle(this.name())
            .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('codeInput')
                            .setLabel('Your TS/JS code')
                            .setPlaceholder("console.log('Hi mom!')")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true),
                    ),
                new ActionRowBuilder<ModalActionRowComponentBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId('flagsInput')
                            .setLabel('Flags')
                            .setPlaceholder("Available flags: async, split, console, ephemeral")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false),
                    ),
            )

    }

    override permissions(): CommandPermissions {
        return {
            adminRole: true,
        }
    }
}