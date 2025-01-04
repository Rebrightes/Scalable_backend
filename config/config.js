import dotenv from "dotenv";
dotenv.config();

export const cosmosDb = {
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
  databaseId: "sovies",
  containerId: "users",
};

export const blobStorage = {
  connectionString: process.env.BLOB_STORAGE_CONNECTION_STRING,
  containerName: "videos",
};

export const jwtSecret = process.env.JWT_SECRET;
