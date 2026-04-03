import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import User from "./models/UserModels.js";
import Transaction from "./models/TransactionModel.js";

await mongoose.connect("mongodb+srv://atulak121202_db_user:assignment@cluster0.gwpnkxa.mongodb.net/?appName=Cluster0");

console.log("DB connected...");

// 🧹 clear old data (optional)
await User.deleteMany();
await Transaction.deleteMany();

// 🧑‍🤝‍🧑 create users
const users = [];

for (let i = 0; i < 10; i++) {
  const user = await User.create({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: "123456", // hashed if middleware exists
  });

  users.push(user);

  const createTransactions = async () => {
    // 💸 create transactions
    const categories = ["food", "rent","travel", "shopping", "salary", "other"];

    const transactions = [];

    for (let i = 0; i < 10; i++) {
      const randomUser = user;

      transactions.push({
        amount: faker.number.int({ min: 50, max: 10000 }),
        type: Math.random() > 0.5 ? "income" : "expense",
        category: faker.helpers.arrayElement(categories),
        note: faker.commerce.productName(),
        date: faker.date.recent({ days: 30 }),
        createdBy: randomUser._id,
      });
    }

    await Transaction.insertMany(transactions);
  };
  await createTransactions();
}

console.log("✅ Dummy data inserted successfully");
process.exit();
