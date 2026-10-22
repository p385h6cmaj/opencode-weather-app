export interface WeatherResponse {
  current?: {
    temperature_2m: number;
  };
  daily?: {
    time: string[];
    temperature_2m_min?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
    wind_speed_10m_max?: (number | null)[];
  };
}
