import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default class DB {
   modifyWebhookUrl(guildId: string, webhookUrl: string) {
        return prisma.serverSettings.update({
            where: {
                serverId: guildId
            },
            data: {
                reportsWebhookUrl: webhookUrl
            }
        })
   }
   getWebhookUrl(guildId: string) {
        return prisma.serverSettings.findFirst({
            where: {
                serverId: guildId
            },
            select: {
                reportsWebhookUrl: true
            }
        })
   }
   getGuildBtnInfo (guildId: string) {
         return prisma.serverSettings.findFirst({
              where: {
                serverId: guildId
              },
                select: {
                    serverId: true,

                }
         })
   }

    /***
     *
     * @param guildId
     * @param userId
     * @returns string | null
     *
     */
   static getDomain (guildId: string, userId: string): string | null {
       prisma.domain.findMany({
            where: {
                serverId: guildId,
            }
        }).then((res: any) => {
            if (res.length > 0) {
                return null;
            }
            let usr = this.getUser(userId);
            if (usr === null) {
                return null;
            }
            for (let i = 0; i < res.length; i++) {
                if (!res.userIdsUsed.includes(userId)) {
                    if (res[i].userIdsUsed.length < this.getServer(guildId).usagePerUser) {
                        res[i].userIdsUsed.push(userId);
                        prisma.domain.update({
                            where: {
                                id: res[i].id
                            },
                            data: {
                                userIdsUsed: res[i].userIdsUsed
                            }
                        })
                    } else {
                        return null;
                    }
                    return res[i].domain;
                }

            }
        })
        return null;
   }

    /***
     * @param userId
     * @returns User | null
     */
    static getUser (userId: string) {
        return prisma.user.findFirst({
            where: {
                id: userId
            }
        })
    }
    static createUser (userId: string, guildId: string) {
        return prisma.user.create({
            data: {
                id: userId,
                usageCount: 0,
                serverId: guildId
            }
        })
    }

    static createServer (guildId: string) {
        return prisma.serverSettings.create({
            data: {
                serverId: guildId,
                usagePerUser: 1,
                reportsWebhookUrl: null
            }
        })
    }

   static createDomain (guildId: string, userId: string, domain: string) {
        return prisma.domain.create({
            data: {
                domain: domain,
                serverId: guildId,
                createdBy: userId,
                updatedBy: userId,
            }
        })
   }


   static updateUsage (guildId: string, usage: number) {
        return prisma.serverSettings.update({
            where: {
                serverId: guildId
            },
            data: {
                usagePerUser: usage
            }
        })
   }

   static getServer (guildId: string): any {
        prisma.serverSettings.findFirst({
            where: {
                serverId: guildId
            }
        }).then((res: any) => {
            if (res === null) {
                return this.createServer(guildId);
            }
            return res;
        })
   }

}