/**
 * Get the first letter of the last name (or first name if last name doesn't exist)
 * to use as an avatar initial.
 *
 * @param firstName - The first name
 * @param lastName - The last name (can be null or undefined)
 * @returns The first letter of the last name, first name, or '?' if both are empty
 */
export function getAvatarInitial(firstName: string, lastName: string | null | undefined): string {
  if (lastName && lastName.trim()) {
    return lastName.trim().charAt(0).toUpperCase()
  }
  if (firstName && firstName.trim()) {
    return firstName.trim().charAt(0).toUpperCase()
  }
  return '?'
}

