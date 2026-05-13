// Predefined neighbourhoods for the MVP
export const NEIGHBOURHOODS = [
  'Riverdale',
  'Mill Woods',
  'Downtown',
  'West End',
  'East Side',
  'North Central',
  'South Park',
  'Whyte Avenue',
]

// Coat colour options
export const COAT_COLOURS = [
  'Black',
  'White',
  'Orange',
  'Grey',
  'Tabby',
  'Tortoiseshell',
  'Calico',
  'Bi-colour',
  'Other',
]

// Health status options
export const HEALTH_STATUS = [
  'Healthy',
  'Minor injury',
  'Looks unwell',
  'Unknown',
]

// Temperament options
export const TEMPERAMENT = [
  'Friendly',
  'Shy',
  'Feral',
  'Unknown',
]

// Cat status options
export const CAT_STATUS = {
  PET: 'pet',
  COMMUNITY_CAT: 'community_cat',
  UNKNOWN: 'unknown',
}

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
