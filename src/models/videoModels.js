import { CosmosClient } from "@azure/cosmos";
import { cosmosDb } from "../../config/config.js";

const client = new CosmosClient({
  endpoint: cosmosDb.endpoint,
  key: cosmosDb.key,
});
const container = client.database(cosmosDb.databaseId).container("videos");

export async function saveVideoMetadata(videoMetadata) {
  const { resource } = await container.items.create(videoMetadata);
  return resource;
}
