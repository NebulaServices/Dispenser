import { PrismaClient } from '@prisma/client';
const Prisma =  new PrismaClient();
import { createSpinner } from 'nanospinner';
import perfy from 'perfy';

export default class DB {
    static async connect () {
        const connectSpin = createSpinner(`Connecting to postgres server`).start();
        perfy.start('dbconnect');
        await Prisma.$connect();
        connectSpin.success({text: `Database connected in ${perfy.end('dbconnect').time}s`});
    }

    linkFetch (action: "getAll" | "getOneUnused", id?: string) {
        switch (action) {
            case "getAll": {
                return 0;
            }
            case "getOneUnused": {
                return 0;
            }
        }
        return 0;
    }

    linkManagement (action: "add" | "remove", domain: string) {

    }

    userManagement (action: "resetOne" | "resetAll" | "getProfileOne", id?: string) {

    }

    settingsManagement () {

    }
}
