import { CosmosClient } from "@azure/cosmos";
import { BlobServiceClient } from "@azure/storage-blob";
import { cosmosDb, blobStorage } from "../../config/config.js";
import seedAdmin from "./seedAdmin.js";

async function setupCosmosDb() {
  const client = new CosmosClient({
    endpoint: cosmosDb.endpoint,
    key: cosmosDb.key,
  });

  const { database } = await client.databases.createIfNotExists({
    id: cosmosDb.databaseId,
  });
  console.log(`Database '${cosmosDb.databaseId}' created or already exists`);

  const { container: usersContainer } =
    await database.containers.createIfNotExists({
      id: cosmosDb.containerId,
    });
  console.log(`Container '${cosmosDb.containerId}' created or already exists`);

  const { container: videosContainer } =
    await database.containers.createIfNotExists({
      id: "videos",
    });
  console.log(`Container 'videos' created or already exists`);
}

async function setupBlobStorage() {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    blobStorage.connectionString
  );
  const containerClient = blobServiceClient.getContainerClient(
    blobStorage.containerName
  );

  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    console.log(`Container '${blobStorage.containerName}' created`);
  } else {
    console.log(`Container '${blobStorage.containerName}' already exists`);
  }
}

export async function setup() {
  await setupCosmosDb();
  await setupBlobStorage();
  await seedAdmin(); // Seed the admin user
}
