/**
 * Compute age from date of birth.
 * Always dynamic — never stored as a static value.
 */
export function computeAge(dob: Date | string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Check if a person is 18+ based on DOB.
 */
export function isAdult(dob: Date | string): boolean {
  return computeAge(dob) >= 18;
}

/**
 * Valid blood groups.
 */
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];
