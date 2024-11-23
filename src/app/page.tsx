import { ClientComponent } from '@/app/client-comp';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
export default async function Home() {
  const data = await db.blog.findMany({
    include: {
      author: true,
    },
  });

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      hello world
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      <ClientComponent />
    </div>
  );
}
