
export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  timeline: number; // weeks
  equipment: string[];
  currentBodyFat?: number; // percentage, optional
  targetBodyFat?: number; // percentage, optional
  goal: 'muscle_gain' | 'fat_loss';
}

export interface BodyMetrics {
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  boneMass?: number;
  visceralFat?: number;
  bmi: number;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string; // e.g., "Monday" or "Day 1"
  focus: string; // e.g., "Push Day", "Legs"
  exercises: Exercise[];
}

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

export interface StretchingRoutine {
  focus: string;
  tips: string;
  movements: string[];
}

export interface FitnessPlan {
  dailyCalories: number;
  waterIntake: number; // ml
  macros: Macros;
  weeklySchedule: WorkoutDay[];
  dietSuggestions: string[]; // List of meal ideas
  foodSwaps: string[]; // List of healthier alternatives
  ageSpecificAdvice: string; // Hormones, sleep, growth
  stretchingRoutine: StretchingRoutine; // New field for stretching
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Currency {
  code: string;
  name: string;
  countryCode: string;
  isMetal?: boolean;
}
