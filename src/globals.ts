import * as dotenv from "dotenv";

dotenv.config({});

/**
 * Pulls out an env var from either the host ENV, or a config file
 *
 * @param {string} local ENV key
 * @param {string} configName Config key
 * @returns {string}
 */
function getEnv(configName: string): string {
  return process.env[configName] as string;
}

export const TICK_SPOT_USER_AGENT = getEnv("TICK_SPOT_USER_AGENT");
