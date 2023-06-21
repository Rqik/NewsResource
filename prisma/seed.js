"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
console.log('sdfsdfdsfs');
async function main() {
    const data = fs_1.default.readFileSync('./prisma/fixture.json');
    const users = JSON.parse(data.toString());
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
