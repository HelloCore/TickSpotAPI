import fetch from "node-fetch";
import TickCacheManager from "./TickCacheManager";
import * as DataLoader from "dataloader";
import { min, max, format, parse } from "date-fns";
import {
  Role,
  Task,
  Project,
  Entry,
  GetEntryRequest,
  CreateEntryRequest,
  UpdateEntryRequest,
  TickspotContextCredential
} from "./TickSpotAPI.types";

class TickSpotAPI {
  constructor(credential: TickspotContextCredential) {
    this.credential = credential;
  }

  credential: TickspotContextCredential;

  get baseURL() {
    return "https://www.tickspot.com/api/v2/";
  }

  get urlWithSubID() {
    return `https://www.tickspot.com/${this.credential.subscriptionId}/api/v2/`;
  }

  get headerFromContext() {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.credential.userAgent,
      Authorization: "Token token=" + this.credential.apiToken
    };
  }

  private async performFetch(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body: string | undefined = undefined
  ) {
    const response = await fetch(url, {
      method,
      body,
      headers: this.headerFromContext
    });
    const json = await response.json();
    return json;
  }

  async getRoles(username: string, password: string): Promise<Role[]> {
    const response = await fetch(`${this.baseURL}roles.json`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": this.credential.userAgent,
        Authorization:
          "Basic " + Buffer.from(username + ":" + password).toString("base64")
      }
    });
    const json = await response.json();
    return json;
  }

  async getProjects(): Promise<Project[]> {
    return this.performFetch(`${this.urlWithSubID}projects.json`, "GET");
  }

  async getTasks(projectId: number): Promise<Task[]> {
    const cachedTasks = TickCacheManager.getTask("" + projectId);
    if (cachedTasks.length > 0) {
      return cachedTasks;
    }

    const json = await this.performFetch(
      `${this.urlWithSubID}projects/${projectId}/tasks.json`,
      "GET"
    );

    TickCacheManager.setTask("" + projectId, json);
    return json;
  }

  async getEntries(request: GetEntryRequest): Promise<Entry[]> {
    return this.performFetch(
      `${this.urlWithSubID}entries.json?start_date='${
        request.start_date
      }'&end_date='${request.end_date}'`,
      "GET"
    );
  }

  async createEntry(request: CreateEntryRequest): Promise<Entry> {
    return this.performFetch(
      `${this.urlWithSubID}entries.json`,
      "POST",
      JSON.stringify(request)
    );
  }

  async updateEntry(request: UpdateEntryRequest): Promise<Entry> {
    return this.performFetch(
      `${this.urlWithSubID}entries/${request.id}.json`,
      "PUT",
      JSON.stringify({
        hours: request.hours,
        notes: request.notes
      })
    );
  }

  async deleteEntry(id: number) {
    const response = await fetch(`${this.urlWithSubID}entries/${id}.json`, {
      method: "DELETE",
      body: undefined,
      headers: this.headerFromContext
    });
    return response.ok;
  }

  async getAllEntries(request: GetEntryRequest): Promise<Entry[]> {
    var entries: Entry[] = [];
    var page: number | null = 1;
    var tempEntries: Entry[] = [];

    while (page != null) {
      tempEntries = await this.getEntries({ ...request, page });
      entries = entries.concat(tempEntries);

      if (tempEntries.length === 100 && page != null) {
        page += 1;
      } else {
        page = null;
      }
    }

    return entries;
  }
  private entryLoader = new DataLoader<Date, Entry[]>(async dates => {
    const startDate = min(...dates);
    const endDate = max(...dates);

    const entriesList = await this.getAllEntries({
      start_date: format(startDate, "YYYY-MM-DD"),
      end_date: format(endDate, "YYYY-MM-DD")
    });

    return dates.map(date => {
      const key = format(date, "YYYY-MM-DD");
      return entriesList.filter(entry => entry.date === key);
    });
  });

  async getEntry(date: string) {
    return this.entryLoader.load(parse(`${date}T00:00:00.000Z`));
  }
}

export default TickSpotAPI;
