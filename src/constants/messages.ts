export const Messages = {
  COMMON: {
    SUCCESS: "Operation successful",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
  },

  VALIDATION: {
    FAILED: "Validation failed",
    INVALID_REQUEST: "Invalid request",
  },

  AUTH: {
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
  },

  LEAD: {
    NOT_FOUND: "Lead not found",
    FETCH_SUCCESS: "Leads fetched successfully",
  },

  SERVER: {
    INTERNAL_ERROR: "Internal server error",
  },
} as const;
