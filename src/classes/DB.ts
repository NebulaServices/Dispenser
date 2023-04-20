import { PrismaClient } from '@prisma/client'
import {WebhookClient} from "discord.js";

const prisma = new PrismaClient()

export default class DB {
   static setWebhookUrl(guildId: string, url: { reports?: string, logs?: string }): Promise <any> {
        return prisma.serverSettings.update({
            where: {
                serverId: guildId
            },
            data: {
                reportsWebhookUrl: url.reports ? url.reports : null,
                logsWebhookUrl: url.logs ? url.logs : null
            }
        })
   }

   static async getBtn(serverId: string): Promise<any> {
       return prisma.serverSettings.findFirstOrThrow({
           where: {
               serverId: serverId
           }
       });
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
                buttonLabel: btn.label ? btn.label : null,
                buttonColor: btn.style ? btn.style : null
            }
        })
    }

    static async getDomain(guildId: string, userId: string): Promise<any> {
        // get the user, if they don't exist, create them
        let user: any = await prisma.user.findFirst({ where: { id: userId } });
        // if no user, create
        if (!user) {
            console.log(`"User doesn't exist, creating user for ${userId} in ${guildId}..."`);
            user = await prisma.user.create({
                data: {
                    id: userId,
                    serverId: guildId,
                    usageCount: 0,
                },
                select: {
                    id: true,
                    usageCount: true,
                    serverId: true,
                    banned: true,
                },
            });
        }

        if (user.banned) {
            return {
                text: "You are banned.",
                type: "error"
            }
        }

        // usage count
        let userUsageCount = user.usageCount;
        // get the server
        let server = await this.getServer(guildId);
        // get the usage per user
        let usagePerUser = server.usagePerUser;

        // if the user has used all their domains, return null
        if (userUsageCount >= usagePerUser) {
            return {
                text: `You have hit the monthly limit of ${server.usagePerUser} Dispenses. Wait until next month to get more!`,
                type: `error`
            }
        }

        // get all domains
        let domains = await prisma.domain.findMany({
            where: {
                serverId: guildId,
            },
        });

        let domainsFiltered = domains.filter((domain) => {
            return !user.usedDomains?.includes(domain.domain);
        });

        if (domainsFiltered.length == 0) {
            return {
                text: `There are no more unique domains left to dispense.`,
                type: `error`
            }
        }

        let randomDomain = domainsFiltered[Math.floor(Math.random() * domainsFiltered.length)]!.domain;

        await prisma.user.updateMany({
            where: {
                id: userId,
                serverId: guildId
            },
            data: {
                usageCount: userUsageCount + 1,
                usedDomains: [...(user.usedDomains ?? []), randomDomain],
            },
        });
        let usageLeft = usagePerUser - (userUsageCount + 1);

        this.logDispense(randomDomain, userId, guildId, usageLeft);

        return {
            domain: randomDomain.startsWith(`https://`) ? randomDomain : `https://${randomDomain}`,
            text: `You have ${usageLeft} use${usageLeft == 1 ? `` : `s`} left this month.`,
            type: `success`
        }
    }



    static async createServer (guildId: string): Promise<any> {
        await prisma.server.create({
            data: {
                serverId: guildId
            }
        })
        return prisma.serverSettings.create({
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


   static updateUsage (serverId: string, usage: number) {
       return prisma.serverSettings.update({
            where: {
                serverId: serverId
            },
            data: {
                usagePerUser: usage
            }
        })
   }

   static async getServer (guildId: string): Promise<any> {
        let s = await prisma.serverSettings.findFirst({
            where: {
                serverId: guildId
            }
        })
       if (!s) {
           await this.createServer(guildId);
           return this.getServer(guildId);
       }
       else return s;
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

    static async resetUserUsage (userId: string, serverId: string, resetDupes: boolean): Promise <any> {
        return prisma.user.updateMany({
            where: {
                id: userId,
                serverId: serverId
            },
            data: {
                usageCount: 0,
                usedDomains: resetDupes ? [] : undefined
            }
        })
    }

    static async resetAll (serverId: string, resetDupes: boolean): Promise <any> {
       return prisma.user.updateMany({
              where: {
                    serverId: serverId
                },
                data: {
                    usageCount: 0,
                    usedDomains: resetDupes ? [] : undefined
              }
        });
    }

    static async banUser (userId: string, serverId: string): Promise <any> {
        return prisma.user.updateMany({
            where: {
                id: userId,
                serverId: serverId
            },
            data: {
                banned: true
            }
        })
    }

    static async unbanUser (userId: string, serverId: string): Promise <any> {
        return prisma.user.updateMany({
            where: {
                id: userId,
                serverId: serverId
            },
            data: {
                banned: false
            }
        })
    }

    static async logDispense (userId: string, serverId: string, domain: string, usageLeft: string | number): Promise <any> {
        let server = await this.getServer(serverId);
        console.log(server)
        if (!server.logsWebhookUrl) return;
        let webhook = new WebhookClient({ url: server.logsWebhookUrl });
        webhook.send({
            embeds: [{
                title: `Dispensed`,
                fields: [
                    {
                        name: `User`,
                        value: `<@${userId}>`,
                    },
                    {
                        name: `Domain`,
                        value: domain
                    },
                    {
                        name: `Server`,
                        value: `<@${serverId}>`
                    },
                    {
                        name: `Usage Left`,
                        value: usageLeft as string
                    }
                ]
            }],
            username: `Dispenser`
        })
    }
}