import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const author = await db.author.create({
    data: {
      name: 'Alice',
    },
  });

  await db.blog.createMany({
    data: new Array(10).fill(0).map((_, i) => ({
      title: `Blog ${i}`,
      authorId: author.id,
      content: `This is the content of blog ${i}`,
    })),
  });
}

main();
