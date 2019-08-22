import { Task } from "./TickSpotAPI.types";

var CacheStorage = {};

const TickCacheManager = {
  setTask: (projectId: string, task: Task[]) => {
    CacheStorage[projectId] = task;
  },
  getTask: (projectId: string): Task[] => {
    if (CacheStorage[projectId] != null) {
      return CacheStorage[projectId];
    }
    return [];
  },
  clear: () => {
    CacheStorage = {};
  }
};

export default TickCacheManager;
