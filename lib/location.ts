export const COUNTRIES = ['India'] as const;

export const STATES_BY_COUNTRY: Record<string, readonly string[]> = {
  India: ['Maharashtra'] as const,
};

export const CITIES_BY_STATE: Record<string, readonly string[]> = {
  Maharashtra: ['Pune', 'Mumbai', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Satara'] as const,
};

export const DEFAULT_COUNTRY = 'India';
export const DEFAULT_STATE = 'Maharashtra';
