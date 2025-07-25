export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  instagramUrl: string;
  rawContent?: string;
  extractedData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  instagramUrl: string;
}

export interface EventResponse {
  success: boolean;
  data: Event;
  message?: string;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  count: number;
}

export interface ExtractedInstagramData {
  rawContent: string;
  caption?: string;
  hashtags: string[];
  mentions: string[];
  metadata: {
    timestamp: string;
    postId: string;
  };
} 