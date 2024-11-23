import { Prisma } from '@prisma/client';
import { writeFileSync } from 'fs';

const dmmf = Prisma.dmmf;

writeFileSync('prisma/dmmf.json', JSON.stringify(dmmf, null, 2));
