// System access levels. Role strings are LOWERCASE to match the frontend (AuthContext, Register page).
const ROLES = Object.freeze({
  ADMIN: 'admin',
  OFFICER: 'officer', // Procurement Officer
  MANAGER: 'manager', // Manager / Approver
  VENDOR: 'vendor',
});

const ROLE_VALUES = Object.freeze(Object.values(ROLES));

// Convenience groupings used by route guards.
const ALL_ROLES = ROLE_VALUES;
const STAFF_ROLES = Object.freeze([ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER]);

module.exports = { ROLES, ROLE_VALUES, ALL_ROLES, STAFF_ROLES };
