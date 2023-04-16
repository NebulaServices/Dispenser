import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default class DB {
   static updateWebhookUrl(guildId: string, webhookUrl: string) {
        return prisma.serverSettings.update({
            where: {
                serverId: guildId
            },
            data: {
                reportsWebhookUrl: webhookUrl
            }
        })
   }
   static getWebhookUrl(guildId: string) {
        return prisma.serverSettings.findFirst({
            where: {
                serverId: guildId
            },
            select: {
                reportsWebhookUrl: true
            }
        })
   }
   static getBtn(guildId: string) {
         return prisma.serverSettings.findFirst({
              where: {
                serverId: guildId
              },
                select: {
                    serverId: true,

                }
         })
   }

    static updateBtn (guildId: string, btn: { emoji: string, label: string, style: string }) {
        if (!this.getServer(guildId)) {
            this.createServer(guildId);
        }
        return prisma.serverSettings.update({
            where: {
                serverId: guildId
            },
            data: {
                buttonEmoji: btn.emoji ? btn.emoji : null,
                buttonLabel: btn.label,
                buttonColor: btn.style ? btn.style : null
            }
        })
    }

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
                    if (res[i].userIdsUsed.length < this.getServer(guildId)) {
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
        prisma.server.create({
            data: {
                serverId: guildId
            }
        })
        prisma.serverSettings.create({
            data: {
                serverId: guildId,
                usagePerUser: 1,
                buttonEmoji: null,
                buttonLabel: "Get Domain",
                buttonColor: "PRIMARY"
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
       if (!this.getServer(guildId)) {
           this.createServer(guildId);
       }
       return prisma.serverSettings.update({
            where: {
                serverId: guildId
            },
            data: {
                usagePerUser: usage
            }
        })
   }

   static getServer (guildId: string) {
        return prisma.serverSettings.findFirst({
            where: {
                serverId: guildId
            },
            select: {
                usagePerUser: true,
            }
        })
   }


    static addDomain(serverId: string, domain: string, userId?: string) {
        return prisma.domain.create({
            data: {
                server: {
                    connect: {
                        serverId: serverId
                    }
                },
                domain: domain,
                createdBy: userId ? userId : null,
            }
        })
    }
}