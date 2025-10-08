export interface SavedTab {
  id: string;
  name: string;
  url: string;
  embeddable: boolean | null;
  createdAt: string;
  groupId?: string;
}

export interface SavedGroup {
  id: string;
  name: string;
}

export interface InternalTab {
  id: string;
  url: string;
  isLoading: boolean;
  isBlocked: boolean;
  key: number; // Used to force iframe re-renders
}

export interface OEmbedData {
  html: string;
  [key: string]: any;
}

export interface LinkCardData {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  url: string;
}
