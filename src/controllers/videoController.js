import { CosmosClient } from "@azure/cosmos";
import { cosmosDb } from "../../config/config.js";

const client = new CosmosClient({
  endpoint: cosmosDb.endpoint,
  key: cosmosDb.key,
});
const container = client.database(cosmosDb.databaseId).container("videos");

export async function getUploadedVideos(req, res) {
  const { query } = req.query;
  let querySpec;

  if (query) {
    querySpec = {
      query: "SELECT * FROM c WHERE CONTAINS(c.title, @query)",
      parameters: [{ name: "@query", value: query }],
    };
  } else {
    querySpec = {
      query: "SELECT * FROM c",
    };
  }

  const { resources: videos } = await container.items
    .query(querySpec)
    .fetchAll();

  // Calculate the average rating for each video
  const videosWithAverageRating = videos.map((video) => {
    const averageRating = video.ratings?.length
      ? video.ratings.reduce((sum, rating) => sum + rating.value, 0) /
        video.ratings.length
      : 0;
    return { ...video, averageRating };
  });

  res.status(200).json(videosWithAverageRating);
}

export async function getVideoDetails(req, res) {
  const { videoId } = req.params;
  try {
    const { resource: video } = await container.item(videoId).read();
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Calculate the average rating
    const averageRating = video.ratings?.length
      ? video.ratings.reduce((sum, rating) => sum + rating.value, 0) /
        video.ratings.length
      : 0;

    res.status(200).json({ ...video, averageRating });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching the video details" });
  }
}

export async function rateVideo(req, res) {
  const { videoId, rating } = req.body;
  const { username } = req.user;

  if (typeof videoId !== "string") {
    return res.status(400).json({ message: "Invalid video ID" });
  }

  const { resource: video } = await container.item(videoId).read();
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  // Initialize ratings array if it doesn't exist
  if (!video.ratings) {
    video.ratings = [];
  }

  video.ratings.push({ username, value: rating });
  await container.item(videoId).replace(video);

  // Calculate the average rating
  const averageRating =
    video.ratings.reduce((sum, rating) => sum + rating.value, 0) /
    video.ratings.length;

  res.json({ ...video, averageRating });
}

export async function commentVideo(req, res) {
  const { videoId, comment } = req.body;
  const { username } = req.user;

  if (typeof videoId !== "string") {
    return res.status(400).json({ message: "Invalid video ID" });
  }

  const { resource: video } = await container.item(videoId).read();
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  // Initialize comments array if it doesn't exist
  if (!video.comments) {
    video.comments = [];
  }

  video.comments.push({ username, text: comment });
  await container.item(videoId).replace(video);
  res.json(video);
}
