

export default class Webhook {
    /***
     * Send a message to the webhook
     * @param userBanned
     * @param userMod
     * @param guildId
     * @param unban
     */
    static sendUserBanUpdateAlert(userBanned: string, userMod: string, guildId: string, unban: boolean): number {
        return 1;
    }
}