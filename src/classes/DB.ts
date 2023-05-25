import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type ButtonType = "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER";
export default class DB {
   static async setWebhookUrl(guildId: string, url: { reports?: string, logs?: string }): Promise <any> {
       let s = await prisma.serverSettings.findFirst({
           where: {
               serverId: guildId
           }
       })
       if (!s) {
           await this.createServer(guildId);
           return this.getServer(guildId);
       }
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

   static async doesReportWebhookUrlExist(guildId: string): Promise<{reports: boolean, logs: boolean}> {
       let s = await prisma.server.findFirst({
            where: {
              serverId: guildId
            },
           select: {
                serverSettings: {
                      select: {
                          reportsWebhookUrl: true,
                          logsWebhookUrl: true
                      }
                }
           }
       })
       return {
              reports: s!.serverSettings!.reportsWebhookUrl != null,
              logs: s!.serverSettings!.logsWebhookUrl != null
       }

   }

   static async getWebhookUrls(guildId: string): Promise<{ reports: string | null, logs?: string | null }> {
        let s = await prisma.serverSettings.findFirst({
           where: {
               serverId: guildId
           },
            select: {
                reportsWebhookUrl: true,
                logsWebhookUrl: true
            }
       })
       return {
           reports: s!.reportsWebhookUrl,
           logs: s!.logsWebhookUrl
       }
   }

   static async getBtn(serverId: string): Promise<any> {
       return prisma.serverSettings.findFirstOrThrow({
           where: {
               serverId: serverId
           }
       });
   }

    static async getDomain(guildId: string, userId: string, groupId: string, roleIds: string[]): Promise<any> {
       if (!groupId) return {
              type: "error",
              text: "No group id"
       }
        let server = await prisma.server.findFirst({
            where: {
                serverId: guildId
            },
            select: {
                serverSettings: {
                    select: {
                        usagePerUser: true
                    }
                },
                users: {
                    where: {
                        userId: userId,
                        serverId: guildId
                    },
                    select: {
                        usageCount: true,
                        usedDomains: true,
                        banned: true,
                        userId: true,
                    }
                },
                domainGroups: {
                    where: {
                        groupId: groupId
                    },
                    select: {
                        domains: true,
                        groupId: true,
                    }
                },
                roles: {
                    where: {
                        serverId: guildId
                    },
                    select: {
                        roleId: true,
                        specialLimit: true,
                    }
                }
            }
        });
        if (!server) {
            await this.createServer(guildId);
            return await this.getDomain(guildId, userId, groupId, roleIds);
        }
        // now the user exists
        let user = server.users.find((user) => user.userId == userId);
        // if no user, create
        if (!user) {
            console.log(`"User doesn't exist, creating user for ${userId} in ${guildId}..."`);
            user = await prisma.user.create({
                data: {
                    userId: userId,
                    serverId: guildId,
                    usageCount: 0,
                },
                select: {
                    userId: true,
                    usageCount: true,
                    serverId: true,
                    banned: true,
                    usedDomains: true,
                },
            });
        }

        if (user.banned) {
            return {
                text: "You are currently banned.",
                type: "error"
            }
        }

        // usage count
        let userUsageCount = user.usageCount;
        // get the usage per user
        let usagePerUser = server.serverSettings!.usagePerUser;

        for (let roleId of roleIds) {
            let role = server.roles.find((role) => role.roleId == roleId);
            if (role && role.specialLimit && role.specialLimit > (usagePerUser ?? 0)) {
                usagePerUser = role.specialLimit;
            }
        }

        if (userUsageCount >= usagePerUser!) {
            return {
                text: `You have hit the monthly limit of ${server.serverSettings!.usagePerUser} Dispenses. Wait until next month to get more!`,
                type: `error`
            }
        }

        // find the domain group with the groupId
        let domainGroup = server.domainGroups.find((domainGroup) => domainGroup.groupId == groupId);
        if (!domainGroup) throw new Error(`Domain group ${groupId} doesn't exist.`);

        let domains = domainGroup.domains;
        let domainsFiltered = domains.filter((domain) => {
            return !user!.usedDomains?.includes(domain.domainName);
        });
        let randomDomain;
        try {
            randomDomain = domainsFiltered[Math.floor(Math.random() * domainsFiltered.length)]!.domainName;
        } catch (e) {
            return {
                text: `Sorry, There are no domains left in this group.`,
                type: `error`
            }
        }

        if (!randomDomain) throw new Error(`Random domain is null for some reason.`);

        await prisma.user.updateMany({
            where: {
                userId: userId,
                serverId: guildId
            },
            data: {
                usageCount: userUsageCount + 1,
                usedDomains: [...(user!.usedDomains ?? []), randomDomain],
            },
        });

        let usageLeft = usagePerUser! - (userUsageCount + 1);

        return {
            domain: randomDomain.startsWith(`https://`) ? randomDomain : `https://${randomDomain}`,
            group: domainGroup.groupId,
            text: `You have ${usageLeft} use${usageLeft == 1 ? `` : `s`} left this month.`,
            type: `success`,
            usageLeft: usageLeft,
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
                reportsWebhookUrl: null,
                logsWebhookUrl: null,
            }
        })
    }

   static async createDomain (serverId: string, userId: string, domain: string, groupId: string) {
       let domainRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
       if (!domainRegex.test(domain)) {
           throw new Error(`Domain ${domain} is not valid.`);
       }
       if (domain.startsWith(`https://`)) {
              domain = domain.replace(`https://`, ``);
       }
       let domainGroup = await prisma.domainGroup.findFirst({
              where: {
                  groupId: groupId,
                  serverId: serverId
              },
              select: {
                  domains: true
              }
       })
       if (!domainGroup) throw new Error(`Domain group ${groupId} doesn't exist.`);
       let domains = domainGroup.domains;
       if (domains.find((d) => d.domainName == domain)) {
           throw new Error(`Domain ${domain} already exists in group \`${groupId}\`.`);
       }
       await prisma.domain.create({
           data: {
               domainName: domain,
               serverId: serverId,
               createdBy: userId,
               createdAt: new Date(),
               domainGroup: {
                   connect: {
                       groupId: groupId
                   }
               }
           }
       })
   }

   static async deleteDomain (serverId: string, domain: string, groupId: string) {
         let domainGroup = await prisma.domainGroup.findFirst({
              where: {
                groupId: groupId,
                serverId: serverId
              },
              select: {
                domains: true
              }
         })
         if (!domainGroup) throw new Error(`Domain group \`${groupId}\` doesn't exist.`);
         let domains = domainGroup.domains;
         if (!domains.find((d) => d.domainName == domain)) {
              throw new Error(`Domain ${domain} doesn't exist in group \`${groupId}\`.`);
         }
         await prisma.domain.deleteMany({
              where: {
                domainName: domain,
                serverId: serverId,
                domainGroup: {
                     groupId: groupId
                }
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


    static async resetUserUsage (userId: string, serverId: string, resetDupes: boolean): Promise <any> {
        return prisma.user.updateMany({
            where: {
                userId: userId,
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
       let s = await prisma.user.findFirst({
                where: {
                    userId: userId,
                    serverId: serverId
                },
                select: {
                    banned: true
                }
       })
       if (s?.banned) throw new Error(`User is already banned.`);
       return prisma.user.updateMany({
           where: {
               userId: userId,
               serverId: serverId
           },
           data: {
               banned: true
           }
       })
    }

    static async unbanUser (userId: string, serverId: string): Promise <any> {
        let s = await prisma.user.findFirst({
            where: {
                userId: userId,
                serverId: serverId
            },
            select: {
                banned: true
            }
        })
        if (!s?.banned) throw new Error(`User is not banned.`);
        return prisma.user.updateMany({
            where: {
                userId: userId,
                serverId: serverId
            },
            data: {
                banned: false
            }
        })
    }

    static async createGroup (serverId: string, groupName: string, userCreated: string, button: { label: string, style: ButtonType, emoji: string }): Promise<any> {
       let server = await prisma.server.findFirst({
           where: {
               serverId: serverId
           },
           select: {
               domainGroups: true
           }
       })
       if (!server) {
           await this.createServer(serverId);
           return this.createGroup(serverId, groupName, userCreated, button);
       }
       let groups = server.domainGroups;
       if (groups.find((group) => group.groupId == groupName)) {
           throw new Error(`Group \`${groupName}\` already exists.`)
       }
       if (groups.length >= 5) {
           throw new Error(`You can only have 5 groups per server.`) // only 5 groups per server until we do multiple actionrows // TODO: multiple actionrows
       }
       return prisma.domainGroup.create({
           data: {
               groupId: groupName,
               serverId: serverId,
               createdBy: userCreated,
               updatedBy: userCreated,
               buttonType: button.style,
               buttonLabel: button.label,
               buttonEmoji: button.emoji,
           }
       })
    }

    static async deleteGroup (serverId: string, groupName: string): Promise<any> {
       let group = await prisma.domainGroup.findFirst({
                where: {
                    groupId: groupName,
                    serverId: serverId
                }
       })
       if (!group) {
           throw new Error(`Group \`${groupName}\` doesn't exist.`)
       }
       return prisma.domainGroup.deleteMany({
           where: {
               groupId: groupName,
               serverId: serverId
           }
       })
    }

    static async getGroups (serverId: string): Promise<any> {
        return prisma.domainGroup.findMany({
            where: {
                serverId: serverId
            },
            select: {
                groupId: true,
                domains: true,
                buttonType: true,
                buttonLabel: true,
                buttonEmoji: true,
                createdBy: true,
                updatedBy: true,
            }
        })
    }

    static async createRole (serverId: string, roleId: string, specialLimit: number): Promise<any> {
        let server = await prisma.server.findFirst({
            where: {
                serverId: serverId
            },
            select: {
                roles: true,
            }
        })
        if (!server) {
            await this.createServer(serverId);
            return this.createRole(serverId, roleId, specialLimit);
        }
        let role = server.roles.find((r) => r.roleId == roleId);
        if (role) {
            throw new Error(`Role \`${roleId}\` already exists.`)
        }

        return prisma.role.create({
            data: {
                roleId: roleId,
                serverId: serverId,
                specialLimit: specialLimit
            }
        })
    }

    static async removeRole (serverId: string, roleId: string): Promise<any> {
        let role = await prisma.role.findFirst({
            where: {
                roleId: roleId,
                serverId: serverId
            },
            select: {
                roleId: true
            }
        })
        if (!role) {
            throw new Error(`Role \`${roleId}\` doesn't exist.`)
        }
        return prisma.role.deleteMany({
            where: {
                roleId: roleId,
                serverId: serverId
            }
        })
    }
}