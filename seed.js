// seed.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const generateRandomLeads = (count) => {
  const leads = [];
  const statuses = ["PROSPECT", "ACTIVE", "UNQUALIFIED"];
  const emailDomains = [
    "example.com",
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "company.com",
  ];

  const firstNames = [
    "John",
    "Mary",
    "Robert",
    "Linda",
    "William",
    "Patricia",
    "David",
    "Jennifer",
    "Michael",
    "Elizabeth",
    "Joseph",
    "Susan",
    "Charles",
    "Jessica",
    "Thomas",
    "Sarah",
    "Daniel",
    "Karen",
    "Matthew",
    "Nancy",
    "James",
    "Lisa",
    "Christopher",
    "Betty",
    "George",
    "Dorothy",
    "Ronald",
    "Sandra",
    "Joseph",
    "Ashley",
    "Richard",
    "Kimberly",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Brown",
    "Taylor",
    "Miller",
    "Anderson",
    "Wilson",
    "Moore",
    "Martin",
    "Jackson",
    "Thompson",
    "White",
    "Harris",
    "Clark",
    "Lewis",
    "Young",
    "Walker",
    "Hall",
    "Allen",
    "Green",
    "Davis",
    "Evans",
    "King",
    "Scott",
  ];

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomNumber = Math.floor(Math.random() * 1000);

    const emailDomain =
      emailDomains[Math.floor(Math.random() * emailDomains.length)];

    const lead = {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber}@${emailDomain}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      estimatedSaleAmount: Math.floor(Math.random() * 10000) + 1000,
    };

    // Calculate estimated commission
    if (lead.status === "UNQUALIFIED") {
      lead.estimatedCommission = 0;
    } else {
      lead.estimatedCommission = parseFloat(
        (lead.estimatedSaleAmount * 0.05).toFixed(2)
      );
    }

    leads.push(lead);
  }

  return leads;
};

async function main() {
  try {
    // Clear the database of existing leads
    await prisma.lead.deleteMany();

    // Generate random leads
    const randomLeads = generateRandomLeads(100); // Change 100 to the desired number of leads

    // Insert random leads into the database
    for (const lead of randomLeads) {
      console.log("Creating\n", "\t", lead, "\n");

      await prisma.lead.create({
        data: lead,
      });
    }

    console.log("Random leads inserted successfully.");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
