export interface Role {
  subscription_id: number;
  company: string;
  api_token: string;
}

export interface Project {
  id: number;
  name: string;
  client_id: number;
  owner_id: number;
  url: string;
}

export interface Task {
  id: number;
  name: string;
  position: number;
  project_id: number;
  url: string;
}

export interface Entry {
  id: number;
  date: string;
  hours: number;
  notes: string;
  task_id: number;
  user_id: number;
  url: string;
}

export interface GetEntryRequest {
  start_date: string;
  end_date: string;
  page?: number;
}

export interface CreateEntryRequest {
  date: string;
  hours: number;
  task_id: number;
  notes?: string;
}

export interface UpdateEntryRequest {
  id: number;
  hours: number;
  notes?: string;
}

export interface TickspotContextCredential {
  apiToken: string;
  subscriptionId: string;
  userAgent: string;
}
