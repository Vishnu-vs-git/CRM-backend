export interface LeadCustomFieldValue {
  fieldId: string;
  label: string;
  type: string;
  value: unknown;
}

export interface Lead {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  phone: string | null;
  countryCode: string | null;
  e164: string | null;
  email: string | null;
  assignedTo: string | null;
  followUpDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  customFields: LeadCustomFieldValue[];
}
