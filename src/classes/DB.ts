import { PrismaClient } from '@prisma/client';
const Prisma =  new PrismaClient();
import { createSpinner } from 'nanospinner';
import perfy from 'perfy';

class DB {
    static async connect() {
        const connectSpin = createSpinner(`Connecting to postgres server`).start();
        perfy.start('dbconnect');
        await Prisma.$connect();
        connectSpin.success({text: `Database connected in ${perfy.end('dbconnect').time}s`});
    }
    async fetchAllDomains(): Promise<void> {

    }
}

export default DB;