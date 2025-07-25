// Re-export shared types
export * from '../../../shared/src/types/models';
export * from '../../../shared/src/types/api';

// Frontend-specific types
export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface InstagramUrlForm {
  url: string;
  isValid: boolean;
} 