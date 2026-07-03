export function calculateAgeYears(birthdate) {
  if (!birthdate) return null
  const birth = new Date(birthdate)
  const age = (Date.now() - birth) / (365.25 * 24 * 60 * 60 * 1000)
  return isNaN(age) || age < 0 ? null : age
}
