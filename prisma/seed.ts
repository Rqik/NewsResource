import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
console.log('sdfsdfdsfs');

async function main() {
  const data = fs.readFileSync('./prisma/fixture.json');
  const users = JSON.parse(data.toString());
  await Object.entries(users).forEach(async ([keys, values]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await prisma[keys].create({ data: values });
  });
  prisma.user.create({
    data: {
      first_name: 'Игорь',
      last_name: 'джабраилов',
      avatar: null,
      login: 'test_login',
      password: 'secret',
      admin: true,
      activate_link: 'ea4d142b-b317-4a1c-8e96-c1bcd81396a2',
      email: 'tabasaranec96@mail.ru',
    },
  });
  console.log('Data seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
