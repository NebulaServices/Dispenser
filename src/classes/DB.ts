import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export type ButtonType = "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER";
export default class DB {
    public prisma = prisma;
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

    static async doesWebhookUrlsExist(guildId: string): Promise<{reports: boolean, logs: boolean}> {
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
        if (!s) return {
            reports: null,
            logs: null
        }
        return {
            reports: s!.reportsWebhookUrl,
            logs: s!.logsWebhookUrl
        }
    }

     static async getDomain(serverId: string, userId: string, groupId: string, roleIds: string[]): Promise<any> {
        if (!groupId) return {
                type: "error",
                userText: "No group id",
                systemText: "No group id"
        }
         let server = await prisma.server.findFirst({
             where: {
                 serverId: serverId
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
                         serverId: serverId
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
                         requiredRoleId: true,
                     }
                 },
                 roles: {
                     where: {
                         serverId: serverId
                     },
                     select: {
                         roleId: true,
                         specialLimit: true,
                     }
                 }
             }
         });
         if (!server) {
             await this.createServer(serverId);
             return await this.getDomain(serverId, userId, groupId, roleIds);
         }

         let user = server.users.find((user) => user.userId == userId);
         if (!user) {
             console.log(`"User doesn't exist, creating user for ${userId} in ${serverId}..."`);
             user = await prisma.user.create({
                 data: {
                     userId: userId,
                     serverId: serverId,
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
                 userText: "You are currently banned.",
                 systemText: `User is banned.`,
                 type: "error"
             }
         }

         let userUsageCount = user.usageCount;
         let usagePerUser = server.serverSettings!.usagePerUser;

         for (let roleId of roleIds) {
             let role = server.roles.find((role) => role.roleId == roleId);
             if (role && role.specialLimit && role.specialLimit > (usagePerUser ?? 0)) {
                 usagePerUser = role.specialLimit;
             }
         }

         let domainGroup = server.domainGroups.find((domainGroup) => domainGroup.groupId == groupId);
         if (!domainGroup) throw new Error(`Domain group ${groupId} doesn't exist.`);

         if (domainGroup.requiredRoleId) {
             if (!roleIds.includes(domainGroup.requiredRoleId)) {
                 return {
                     userText: `The role <@&${domainGroup.requiredRoleId}> to dispense from this group.`,
                     systemText: `User doesn't have the required role (<@&${domainGroup.requiredRoleId}>)`,
                     type: `error`
                 }
             }
         }

         if (userUsageCount >= usagePerUser!) {
             return {
                 userText: `You have hit your monthly limit of ${userUsageCount} Dispenses. Wait until next month to get more!`,
                    systemText: `User has hit their monthly limit of ${userUsageCount} Dispenses.`,
                 type: `error`
             }
         }



         let domains = domainGroup.domains;
         let domainsFiltered = domains.filter((domain) => {
             return !user!.usedDomains?.includes(domain.domainName);
         });
         let randomDomain;
         try {
             randomDomain = domainsFiltered[Math.floor(Math.random() * domainsFiltered.length)]!.domainName;
         } catch (e) {
             return {
                 userText: `Sorry, There are no domains left in this group.`,
                 systemText: `User has no domains left in group ${groupId}.`,
                 type: `error`
             }
         }

         if (!randomDomain) throw new Error();


         let usageLeft = usagePerUser! - (userUsageCount + 1);

         return {
             domain: randomDomain.startsWith(`https://`) ? randomDomain : `https://${randomDomain}`,
             domainClean: randomDomain,
             group: domainGroup.groupId,
             userText: `You have ${usageLeft} use${usageLeft == 1 ? `` : `s`} left this month.`,
             systemText: `User has ${usageLeft} use${usageLeft == 1 ? `` : `s`} left this month.`,
             type: `success`,
             usageLeft: usageLeft,
             usageCount: userUsageCount,
         }
     }

     static async setUsed (guildId: string, userId: string, domain: string, usageLeft: number): Promise<any> {
        await prisma.user.updateMany({
             where: {
                 userId: userId,
                 serverId: guildId
             },
             data: {
                 usageCount: usageLeft + 1,
                 usedDomains: {
                        push: domain
                 }
             },
         });
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

    static async createGroup (serverId: string, groupName: string, userCreated: string, button: { label: string, style: ButtonType, emoji: string }, roleId?: string): Promise<any> {
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
           return this.createGroup(serverId, groupName, userCreated, button, roleId);
       }
       let groups = server.domainGroups;
       if (groups.find((group) => group.groupId == groupName)) {
           throw new Error(`Group \`${groupName}\` already exists.`)
       }
       if (groups.length >= 15) {
           throw new Error(`You can only have 15 groups per server.`) // I think this is good enough
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
               requiredRoleId: roleId
           }
       })
    }
    static async editGroup (serverId: string, groupName: string, userUpdated: string, button: { label: string, style: ButtonType, emoji: string }, roleId?: string): Promise<any> {
        let server = await prisma.server.findFirst({
            where: {
                serverId: serverId
            },
            select: {
                domainGroups: true
            }
        })
        if (!server) {
            throw new Error(`No groups exist for this server.`)
        }
        let groups = server.domainGroups;
        let group = groups.find((group) => group.groupId == groupName)!;
        if (!group) {
            throw new Error(`Group \`${groupName}\` doesn't exist.`)
        }
        return prisma.domainGroup.updateMany({
            where: {
                groupId: groupName,
                serverId: serverId
            },
            data: {
                updatedBy: userUpdated ? userUpdated : group.updatedBy,
                buttonType: button.style ? button.style : group.buttonType,
                buttonLabel: button.label ? button.label : group.buttonLabel,
                buttonEmoji: button.emoji ? button.emoji : group.buttonEmoji,
                requiredRoleId: roleId ? roleId : group.requiredRoleId
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

    static async createRole (serverId: string, roleId: string, specialLimit: number, admin: boolean): Promise<any> {
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
            return this.createRole(serverId, roleId, specialLimit, admin);
        }
        let role = server.roles.find((r) => r.roleId == roleId);
        if (role) {
            throw new Error(`Role \`${roleId}\` already exists.`)
        }

        return prisma.role.create({
            data: {
                roleId: roleId,
                serverId: serverId,
                specialLimit: specialLimit,
                adminRole: admin
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

    static async getServerUsage (serverId: string): Promise<any> {
        let server = await prisma.serverSettings.findFirst({
            where: {
                serverId: serverId
            },
            select: {
                usagePerUser: true
            }
        })
        if (!server) {
            await this.createServer(serverId);
            return this.getServerUsage(serverId);
        }
        return server.usagePerUser;
    }

    static async editRole (serverId: string, roleId: string, specialLimit?: number, admin?: boolean): Promise<any> {
        let server = await prisma.server.findFirst({
            where: {
                serverId: serverId
            },
            select: {
                roles: true
            }
        })
        if (!server) {
            throw new Error(`No roles exist for this server.`)
        }
        let role = server.roles.find((r) => r.roleId == roleId);
        if (!role) {
            throw new Error(`Role \`${roleId}\` doesn't exist.`)
        }

        return prisma.role.updateMany({
            where: {
                roleId: roleId,
                serverId: serverId
            },
            data: {
                roleId: roleId ? roleId : role.roleId,
                serverId: serverId ? serverId : role.serverId,
                specialLimit: specialLimit ? specialLimit : role.specialLimit,
                adminRole: admin ? admin : role.adminRole
            }
        })
    }

    static async getUser (userId: string, serverId: string): Promise<any> {
        return prisma.user.findFirst({
            where: {
                userId: userId,
                serverId: serverId
            },
            select: {
                userId: true,
                serverId: true,
                usageCount: true,
                usedDomains: true,
                banned: true
            }
        });
    }

    static async getAll (serverId: string, type: 'links' | 'groups' | 'roles'): Promise<any> {
        switch (type) {
            case 'links':
                return prisma.domain.findMany({
                    where: {
                        serverId: serverId
                    },
                    select: {
                        domainName: true,
                    }
                })
            case 'groups':
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
                        requiredRoleId: true
                    }
                })
            case 'roles':
                return prisma.role.findMany({
                    where: {
                        serverId: serverId
                    },
                    select: {
                        roleId: true,
                        specialLimit: true,
                        adminRole: true
                    }
                })
        }
    }

    static async getAdminRoles (): Promise<Map<string, string[]>> {
        let roles = await prisma.role.findMany({
            where: {
                adminRole: true
            },
            select: {
                roleId: true,
                serverId: true
            }
        })
        let map = new Map<string, string[]>();
        for (let role of roles) {
            if (!map.has(role.serverId)) {
                await map.set(role.serverId, []);
            }
            map.get(role.serverId)!.push(role.roleId);
        }
        return map;
    }

}