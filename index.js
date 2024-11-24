const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { create } = require("domain");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
async function main() {
await   prisma.contact.createMany({
    data: [
      {
        id: 11,
        phoneNumber: "919191",
        email: "george@hillvalley.edu",
        linkedId: null,
        linkPrecedence: "primary",
        createdAt: "2023-04-11T00:00:00.374Z",
        updatedAt: "2023-04-11T00:00:00.374Z",
        deletedAt: null,
      },
      {
        id: 27,
        phoneNumber: "717171",
        email: "biffsucks@hillvalley.edu",
        linkedId: null,
        linkPrecedence: "primary",
        createdAt: "2023-04-21T05:30:00.11Z",
        updatedAt: "2023-04-21T05:30:00.11Z",
        deletedAt: null,
      },
    ],
  });
}
main()

app.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;
  try {
    const allUsers = await prisma.contact.findMany({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });
    if (allUsers.length === 0) {
      const user = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });
      return res.status(200).json({
        contact: {
          primaryContatctId: user.id,
          emails: [user.email],
          phoneNumbers: [user.phoneNumber],
          secondaryContactIds: [],
        },
      });
    }
    const primaryUser = allUsers.find(
      (user) => user.linkPrecedence === "primary"
    );
    const secondaryUsers = allUsers.filter((user) => {
      return user.id !== primaryUser.id;
    });
    const secondaryContactIds = secondaryUsers.map((user) => user.id);

    for (const user of allUsers) {
      if (user.id !== primaryUser.id) {
        await prisma.contact.update({
          where: {
            id: user.id,
          },
          data: {
            linkPrecedence: "secondary",
            linkedId: primaryUser.id,
          },
        });
      }
    }
     const getUnique = (arr) => {
       const uniqueArr= [];
       arr.map((item) => {
         if (!uniqueArr.includes(item)) {
           uniqueArr.push(item);
         }  
       });
       return uniqueArr;
     };

     const emails = getUnique(allUsers.map((c) => c.email));
     const phoneNumbers = getUnique(allUsers.map((c) => c.phoneNumber));

    return res.status(200).json({
      contact: {
        primaryContactId: primaryUser.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
