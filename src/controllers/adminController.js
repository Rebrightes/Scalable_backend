import bcrypt from "bcrypt";
import { CosmosClient } from "@azure/cosmos";
import { createUser } from "../models/userModels.js";
import { saveVideoMetadata } from "../models/videoModels.js";
import { BlobServiceClient } from "@azure/storage-blob";
import { blobStorage, cosmosDb } from "../../config/config.js";

const client = new CosmosClient({
  endpoint: cosmosDb.endpoint,
  key: cosmosDb.key,
});
const container = client.database(cosmosDb.databaseId).container("videos");

const blobServiceClient = BlobServiceClient.fromConnectionString(
  blobStorage.connectionString
);
const containerClient = blobServiceClient.getContainerClient(
  blobStorage.containerName
);

export async function createAdmin(req, res) {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await createUser({
    username,
    password: hashedPassword,
    role: "admin",
  });
  res.status(201).json(admin);
}

export async function uploadVideo(req, res) {
  const { title, category } = req.body;
  const { file } = req;

  if (!file) {
    return res.status(400).send("No file uploaded");
  }
  if (!file.originalname.match(/\.(mp4|avi|mov)$/i)) {
    return res
      .status(400)
      .send("Invalid file type. Only MP4, AVI, or MOV are allowed.");
  }
  // Upload the video to Azure Blob Storage
  const blockBlobClient = containerClient.getBlockBlobClient(file.originalname);
  await blockBlobClient.uploadData(file.buffer);

  // Save video metadata to the database (assuming you have a function to do this)
  const videoMetadata = {
    title,
    category,
    filename: file.originalname,
    url: blockBlobClient.url,
  };
  // Assuming you have a function saveVideoMetadata to save the metadata to the database
  const savedMetadata = await saveVideoMetadata(videoMetadata);

  res.status(201).json({
    message: "Video uploaded successfully",
    video: savedMetadata,
  });
}

export async function getAllUploadedVideos(req, res) {
  try {
    const { resources: videos } = await container.items
      .query("SELECT * FROM c")
      .fetchAll();
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the videos" });
  }
}
