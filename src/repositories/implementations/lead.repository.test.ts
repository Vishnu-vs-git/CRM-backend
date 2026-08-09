import { describe, expect, it } from "vitest";
import { prisma } from "../../config/prisma";
import { LeadRepository } from "./lead.repository";

describe("LeadRepository", () => {
  const repository = new LeadRepository(prisma);

  it("should return leads only from the authenticated tenant", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    const result = await repository.queryLeads(query, auth);

    expect(result.leads.length).toBeGreaterThan(0);

    for (const lead of result.leads) {
      expect(lead.tenantId).toBe(auth.tenantId);
    }
  });

  it("should search leads using q", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      q: "Meera",
      filters: [],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    const result = await repository.queryLeads(query, auth);

    expect(result.total).toBe(1);
    expect(result.leads).toHaveLength(1);
    expect(result.leads[0]?.name).toBe("Meera Thomas");
  });
  it("should apply multiple filters using AND logic", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [
        {
          fieldId: "d0982642-e45a-4031-8d33-b8cb683a1910",
          fieldType: "string" as const,
          condition: "is" as const,
          value: "Kochi",
        },
        {
          fieldId: "f33e69d1-45eb-4ad3-81b7-c02da4d1a578",
          fieldType: "number" as const,
          condition: "greater than" as const,
          value: "70000",
        },
      ],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    const result = await repository.queryLeads(query, auth);

    expect(result.total).toBe(1);
    expect(result.leads).toHaveLength(1);
    expect(result.leads[0]?.name).toBe("Ram Kumar");
  });

  it("should apply multiple filters using OR logic", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [
        {
          fieldId: "d0982642-e45a-4031-8d33-b8cb683a1910",
          fieldType: "string" as const,
          condition: "is" as const,
          value: "Kochi",
        },
        {
          fieldId: "d0982642-e45a-4031-8d33-b8cb683a1910",
          fieldType: "string" as const,
          condition: "is" as const,
          value: "Trivandrum",
        },
      ],
      logic: "OR" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    const result = await repository.queryLeads(query, auth);

    expect(result.total).toBe(2);

    const names = result.leads.map((lead) => lead.name);

    expect(names).toContain("Ram Kumar");
    expect(names).toContain("Meera Thomas");
  });

  it("should paginate leads correctly", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const page1 = await repository.queryLeads(
      {
        filters: [],
        logic: "AND" as const,
        page: 1,
        limit: 1,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    const page2 = await repository.queryLeads(
      {
        filters: [],
        logic: "AND" as const,
        page: 2,
        limit: 1,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(page1.leads).toHaveLength(1);
    expect(page2.leads).toHaveLength(1);

    expect(page1.total).toBe(2);
    expect(page2.total).toBe(2);

    expect(page1.leads[0]?.id).not.toBe(page2.leads[0]?.id);
  });

  it("should sort leads by followUpDate ascending and descending", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const ascending = await repository.queryLeads(
      {
        filters: [],
        logic: "AND" as const,
        page: 1,
        limit: 10,
        sortBy: "followUpDate" as const,
        sortDirection: "asc" as const,
      },
      auth,
    );

    expect(ascending.leads[0]?.name).toBe("Ram Kumar");
    expect(ascending.leads[1]?.name).toBe("Meera Thomas");

    const descending = await repository.queryLeads(
      {
        filters: [],
        logic: "AND" as const,
        page: 1,
        limit: 10,
        sortBy: "followUpDate" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(descending.leads[0]?.name).toBe("Meera Thomas");
    expect(descending.leads[1]?.name).toBe("Ram Kumar");
  });

  it("should filter custom number fields correctly", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [
        {
          fieldId: "f33e69d1-45eb-4ad3-81b7-c02da4d1a578",
          fieldType: "number" as const,
          condition: "greater than" as const,
          value: "80000",
        },
      ],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    const result = await repository.queryLeads(query, auth);

    expect(result.total).toBe(1);
    expect(result.leads).toHaveLength(1);
    expect(result.leads[0]?.name).toBe("Meera Thomas");
  });

  it("should filter custom date fields correctly", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [
        {
          fieldId: "34501a86-9792-4aad-a660-9810590f8d74",
          fieldType: "date" as const,
          condition: "after" as const,
          value: "2026-08-10",
        },
      ],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    const result = await repository.queryLeads(query, auth);

    expect(result.total).toBe(1);
    expect(result.leads).toHaveLength(1);
    expect(result.leads[0]?.name).toBe("Meera Thomas");
  });

  it("should filter custom boolean fields correctly", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [
        {
          fieldId: "7b4d0472-b7f4-4c6f-a5ac-8d31ff63e298",
          fieldType: "boolean" as const,
          condition: "is" as const,
          value: "true",
        },
      ],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    const result = await repository.queryLeads(query, auth);

    expect(result.total).toBe(2);
    expect(result.leads).toHaveLength(2);

    const names = result.leads.map((lead) => lead.name);

    expect(names).toContain("Ram Kumar");
    expect(names).toContain("Meera Thomas");
  });
  it("should reject an invalid number filter value", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [
        {
          fieldId: "f33e69d1-45eb-4ad3-81b7-c02da4d1a578",
          fieldType: "number" as const,
          condition: "greater than" as const,
          value: "not-a-number",
        },
      ],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    await expect(repository.queryLeads(query, auth)).rejects.toThrow(
      "Invalid number value for custom field 'f33e69d1-45eb-4ad3-81b7-c02da4d1a578'",
    );
  });

  it("should reject an invalid date filter value", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [
        {
          fieldId: "34501a86-9792-4aad-a660-9810590f8d74",
          fieldType: "date" as const,
          condition: "after" as const,
          value: "invalid-date",
        },
      ],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    await expect(repository.queryLeads(query, auth)).rejects.toThrow();
  });
  it("should reject an invalid boolean filter value", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const query = {
      filters: [
        {
          fieldId: "7b4d0472-b7f4-4c6f-a5ac-8d31ff63e298",
          fieldType: "boolean" as const,
          condition: "is" as const,
          value: "invalid",
        },
      ],
      logic: "AND" as const,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortDirection: "desc" as const,
    };

    await expect(repository.queryLeads(query, auth)).rejects.toThrow();
  });
  it("should never return leads from another tenant", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.leads.length).toBeGreaterThan(0);

    expect(result.leads.every((lead) => lead.tenantId === auth.tenantId)).toBe(
      true,
    );

    expect(result.leads.some((lead) => lead.name === "Beta Customer One")).toBe(
      false,
    );
  });

  it("should return only leads assigned to the authenticated agent", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "AGENT" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.leads.length).toBeGreaterThan(0);

    for (const lead of result.leads) {
      expect(lead.assignedTo).toBe(auth.userId);
      expect(lead.tenantId).toBe(auth.tenantId);
    }
  });
  it("should return all tenant leads for an admin", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.total).toBe(5);
    expect(result.leads).toHaveLength(5);

    for (const lead of result.leads) {
      expect(lead.tenantId).toBe(auth.tenantId);
    }
  });
  it("should filter system name using contains", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [
          {
            fieldId: "name",
            fieldType: "string" as const,
            condition: "contain" as const,
            value: "Meera",
          },
        ],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.total).toBe(1);
    expect(result.leads[0]?.name).toBe("Meera Thomas");
  });
  it("should filter system name using starts with", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [
          {
            fieldId: "name",
            fieldType: "string" as const,
            condition: "starts with" as const,
            value: "Mee",
          },
        ],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.total).toBe(1);
    expect(result.leads[0]?.name).toBe("Meera Thomas");
  });
  it("should filter system name using ends with", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [
          {
            fieldId: "name",
            fieldType: "string" as const,
            condition: "ends with" as const,
            value: "Thomas",
          },
        ],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.total).toBe(1);
    expect(result.leads[0]?.name).toBe("Meera Thomas");
  });
  it("should filter system name using does not contain", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [
          {
            fieldId: "name",
            fieldType: "string" as const,
            condition: "does not contain" as const,
            value: "Meera",
          },
        ],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.total).toBe(4);

    expect(result.leads.every((lead) => !lead.name.includes("Meera"))).toBe(
      true,
    );
  });
  it("should filter system email using is", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [
          {
            fieldId: "email",
            fieldType: "string" as const,
            condition: "is" as const,
            value: "meera@example.com",
          },
        ],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.total).toBe(1);
    expect(result.leads[0]?.name).toBe("Meera Thomas");
  });
  it("should filter system followUpDate using after", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [
          {
            fieldId: "followUpDate",
            fieldType: "date" as const,
            condition: "after" as const,
            value: "2026-08-15",
          },
        ],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.total).toBe(1);
    expect(result.leads[0]?.name).toBe("Suresh Menon");
  });
  it("should filter system followUpDate using before", async () => {
    const auth = {
      tenantId: "747188d0-a004-4a01-bac5-6ad0d8e7f891",
      userId: "2aef87fb-4672-4761-a828-488e03e5928e",
      role: "ADMIN" as const,
    };

    const result = await repository.queryLeads(
      {
        filters: [
          {
            fieldId: "followUpDate",
            fieldType: "date" as const,
            condition: "before" as const,
            value: "2026-08-11",
          },
        ],
        logic: "AND" as const,
        page: 1,
        limit: 20,
        sortBy: "createdAt" as const,
        sortDirection: "desc" as const,
      },
      auth,
    );

    expect(result.total).toBe(1);
    expect(result.leads[0]?.name).toBe("Ram Kumar");
  });
});
