import {PrismaClient} from"../src/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import dotenv from"dotenv";
dotenv.config();

const adapter = new PrismaPg({
  connectionString:process.env.DATABASE_URL!
})
const prisma = new PrismaClient({
  adapter
});

async function main() {
  console.log("Starting database seed...");
  const tenantA = await prisma.tenant.upsert({
  where: {
    id: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
  },
  create: {
    id: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
    name: "Acme CRM",
  },
  update: {
    name: "Acme CRM",
  },
});

 const tenantB = await prisma.tenant.upsert({
  where: {
    id: "88e03f00-82d8-4db7-a983-f30ff327ab77",
  },
  create: {
    id: "88e03f00-82d8-4db7-a983-f30ff327ab77",
    name: "Beta CRM",
  },
  update: {
    name: "Beta CRM",
  },
});

  console.log("Tenants created:", {
    tenantA: tenantA.id,
    tenantB: tenantB.id,
  });
   const alice = await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenantA.id,
      email: "alice@acme.test",
    },
  },
  create: {
    tenantId: tenantA.id,
    name: "Alice",
    email: "alice@acme.test",
    phone: "+919900000001",
    role: "OWNER",
  },
  update: {
    name: "Alice",
    phone: "+919900000001",
    role: "OWNER",
  },
});

 const bob = await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenantA.id,
      email: "bob@acme.test",
    },
  },
  create: {
    tenantId: tenantA.id,
    name: "Bob",
    email: "bob@acme.test",
    phone: "+919900000002",
    role: "ADMIN",
  },
  update: {
    name: "Bob",
    phone: "+919900000002",
    role: "ADMIN",
  },
});
const carol = await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenantA.id,
      email: "carol@acme.test",
    },
  },
  create: {
    tenantId: tenantA.id,
    name: "Carol",
    email: "carol@acme.test",
    phone: "+919900000003",
    role: "MANAGER",
  },
  update: {
    name: "Carol",
    phone: "+919900000003",
    role: "MANAGER",
  },
});

 const rahul = await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenantA.id,
      email: "rahul@acme.test",
    },
  },
  create: {
    tenantId: tenantA.id,
    name: "Rahul",
    email: "rahul@acme.test",
    phone: "+919900000004",
    role: "AGENT",
  },
  update: {
    name: "Rahul",
    phone: "+919900000004",
    role: "AGENT",
  },
});
const anil = await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenantA.id,
      email: "anil@acme.test",
    },
  },
  create: {
    tenantId: tenantA.id,
    name: "Anil",
    email: "anil@acme.test",
    phone: "+919900000005",
    role: "AGENT",
  },
  update: {
    name: "Anil",
    phone: "+919900000005",
    role: "AGENT",
  },
});
const david = await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenantB.id,
      email: "david@beta.test",
    },
  },
  create: {
    tenantId: tenantB.id,
    name: "David",
    email: "david@beta.test",
    phone: "+919900000006",
    role: "OWNER",
  },
  update: {
    name: "David",
    phone: "+919900000006",
    role: "OWNER",
  },
});
const john = await prisma.user.upsert({
  where: {
    tenantId_email: {
      tenantId: tenantB.id,
      email: "john@beta.test",
    },
  },
  create: {
    tenantId: tenantB.id,
    name: "John",
    email: "john@beta.test",
    phone: "+919900000007",
    role: "AGENT",
  },
  update: {
    name: "John",
    phone: "+919900000007",
    role: "AGENT",
  },
});

  console.log("Users created.");
 const cityField = await prisma.customField.upsert({
  where: {
    tenantId_label: {
      tenantId: tenantA.id,
      label: "City",
    },
  },
  create: {
    tenantId: tenantA.id,
    label: "City",
    type: "STRING",
    status: "ACTIVE",
  },
  update: {
    type: "STRING",
    status: "ACTIVE",
  },
});

const budgetField = await prisma.customField.upsert({
  where: {
    tenantId_label: {
      tenantId: tenantA.id,
      label: "Budget",
    },
  },
  create: {
    tenantId: tenantA.id,
    label: "Budget",
    type: "NUMBER",
    status: "ACTIVE",
  },
  update: {
    type: "NUMBER",
    status: "ACTIVE",
  },
});
const interestedField = await prisma.customField.upsert({
  where: {
    tenantId_label: {
      tenantId: tenantA.id,
      label: "Interested",
    },
  },
  create: {
    tenantId: tenantA.id,
    label: "Interested",
    type: "BOOLEAN",
    status: "ACTIVE",
  },
  update: {
    type: "BOOLEAN",
    status: "ACTIVE",
  },
});
const followUpField = await prisma.customField.upsert({
  where: {
    tenantId_label: {
      tenantId: tenantA.id,
      label: "Follow Up",
    },
  },
  create: {
    tenantId: tenantA.id,
    label: "Follow Up",
    type: "DATE",
    status: "ACTIVE",
  },
  update: {
    type: "DATE",
    status: "ACTIVE",
  },
});
const productsField = await prisma.customField.upsert({
  where: {
    tenantId_label: {
      tenantId: tenantA.id,
      label: "Products",
    },
  },
  create: {
    tenantId: tenantA.id,
    label: "Products",
    type: "MULTISELECT",
    status: "ACTIVE",
  },
  update: {
    type: "MULTISELECT",
    status: "ACTIVE",
  },
});

console.log("Custom fields created.");
const ram = await prisma.lead.upsert({
  where: {
    id: "11111111-1111-4111-8111-111111111111",
  },
  create: {
    id: "11111111-1111-4111-8111-111111111111",
    tenantId: tenantA.id,
    userId: rahul.id,
    name: "Ram Kumar",
    phone: "9876543210",
    countryCode: "+91",
    e164: "+919876543210",
    email: "ram@example.com",
    assignedTo: rahul.id,
    followUpDate: new Date("2026-08-10"),
  },
  update: {
    tenantId: tenantA.id,
    userId: rahul.id,
    name: "Ram Kumar",
    phone: "9876543210",
    countryCode: "+91",
    e164: "+919876543210",
    email: "ram@example.com",
    assignedTo: rahul.id,
    followUpDate: new Date("2026-08-10"),
  },
});

const priya = await prisma.lead.upsert({
  where: {
    id: "22222222-2222-4222-8222-222222222222",
  },
  create: {
    id: "22222222-2222-4222-8222-222222222222",
    tenantId: tenantA.id,
    userId: rahul.id,
    name: "Priya Nair",
    phone: "9876543211",
    countryCode: "+91",
    e164: "+919876543211",
    email: "priya@example.com",
    assignedTo: anil.id,
    followUpDate: new Date("2026-08-12"),
  },
  update: {
    tenantId: tenantA.id,
    userId: rahul.id,
    name: "Priya Nair",
    phone: "9876543211",
    countryCode: "+91",
    e164: "+919876543211",
    email: "priya@example.com",
    assignedTo: anil.id,
    followUpDate: new Date("2026-08-12"),
  },
});

const arun = await prisma.lead.upsert({
  where: {
    id: "33333333-3333-4333-8333-333333333333",
  },
  create: {
    id: "33333333-3333-4333-8333-333333333333",
    tenantId: tenantA.id,
    userId: anil.id,
    name: "Arun Kumar",
    phone: "9876543212",
    countryCode: "+91",
    e164: "+919876543212",
    email: "arun@example.com",
    assignedTo: null,
    followUpDate: null,
  },
  update: {
    tenantId: tenantA.id,
    userId: anil.id,
    name: "Arun Kumar",
    phone: "9876543212",
    countryCode: "+91",
    e164: "+919876543212",
    email: "arun@example.com",
    assignedTo: null,
    followUpDate: null,
  },
});

const meera = await prisma.lead.upsert({
  where: {
    id: "44444444-4444-4444-8444-444444444444",
  },
  create: {
    id: "44444444-4444-4444-8444-444444444444",
    tenantId: tenantA.id,
    userId: rahul.id,
    name: "Meera Thomas",
    phone: "9876543213",
    countryCode: "+91",
    e164: "+919876543213",
    email: "meera@example.com",
    assignedTo: rahul.id,
    followUpDate: new Date("2026-08-15"),
  },
  update: {
    tenantId: tenantA.id,
    userId: rahul.id,
    name: "Meera Thomas",
    phone: "9876543213",
    countryCode: "+91",
    e164: "+919876543213",
    email: "meera@example.com",
    assignedTo: rahul.id,
    followUpDate: new Date("2026-08-15"),
  },
});

const suresh = await prisma.lead.upsert({
  where: {
    id: "55555555-5555-4555-8555-555555555555",
  },
  create: {
    id: "55555555-5555-4555-8555-555555555555",
    tenantId: tenantA.id,
    userId: anil.id,
    name: "Suresh Menon",
    phone: "9876543214",
    countryCode: "+91",
    e164: "+919876543214",
    email: "suresh@example.com",
    assignedTo: anil.id,
    followUpDate: new Date("2026-08-18"),
  },
  update: {
    tenantId: tenantA.id,
    userId: anil.id,
    name: "Suresh Menon",
    phone: "9876543214",
    countryCode: "+91",
    e164: "+919876543214",
    email: "suresh@example.com",
    assignedTo: anil.id,
    followUpDate: new Date("2026-08-18"),
  },
});

console.log("Leads created.");

const customValues = [
  {
    leadId: ram.id,
    fieldId: cityField.id,
    value: "Kochi",
  },
  {
    leadId: ram.id,
    fieldId: budgetField.id,
    value: "75000",
  },
  {
    leadId: ram.id,
    fieldId: interestedField.id,
    value: "true",
  },
  {
    leadId: ram.id,
    fieldId: followUpField.id,
    value: "2026-08-10",
  },
  {
    leadId: ram.id,
    fieldId: productsField.id,
    value: "CAR,BIKE",
  },

  {
    leadId: priya.id,
    fieldId: cityField.id,
    value: "Kochi",
  },
  {
    leadId: priya.id,
    fieldId: budgetField.id,
    value: "50000",
  },
  {
    leadId: priya.id,
    fieldId: interestedField.id,
    value: "false",
  },
  {
    leadId: priya.id,
    fieldId: followUpField.id,
    value: "2026-08-12",
  },
  {
    leadId: priya.id,
    fieldId: productsField.id,
    value: "BIKE",
  },

  {
    leadId: arun.id,
    fieldId: cityField.id,
    value: "Chennai",
  },
  {
    leadId: arun.id,
    fieldId: budgetField.id,
    value: "100000",
  },
  {
    leadId: arun.id,
    fieldId: interestedField.id,
    value: "true",
  },
  {
    leadId: arun.id,
    fieldId: productsField.id,
    value: "LAPTOP",
  },

  {
    leadId: meera.id,
    fieldId: cityField.id,
    value: "Trivandrum",
  },
  {
    leadId: meera.id,
    fieldId: budgetField.id,
    value: "85000",
  },
  {
    leadId: meera.id,
    fieldId: interestedField.id,
    value: "true",
  },
  {
    leadId: meera.id,
    fieldId: followUpField.id,
    value: "2026-08-15",
  },
  {
    leadId: meera.id,
    fieldId: productsField.id,
    value: "CAR,LAPTOP",
  },

  {
    leadId: suresh.id,
    fieldId: cityField.id,
    value: "Kochi",
  },
  {
    leadId: suresh.id,
    fieldId: budgetField.id,
    value: "60000",
  },
  {
    leadId: suresh.id,
    fieldId: interestedField.id,
    value: "false",
  },
  {
    leadId: suresh.id,
    fieldId: followUpField.id,
    value: "2026-08-18",
  },
  {
    leadId: suresh.id,
    fieldId: productsField.id,
    value: "CAR",
  },
];

for (const customValue of customValues) {
  await prisma.leadCustomFieldValue.upsert({
    where: {
      leadId_fieldId: {
        leadId: customValue.leadId,
        fieldId: customValue.fieldId,
      },
    },
    create: customValue,
    update: {
      value: customValue.value,
    },
  });
}

console.log("Custom field values created.");

}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });