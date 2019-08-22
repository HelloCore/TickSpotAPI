import TickSpotAPI from "./api/TickSpotAPI";
import { TickspotContextCredential } from "./api/TickSpotAPI.types";

export type TickspotContext = TickspotContextCredential & {
  tickSpotAPI: TickSpotAPI;
};
