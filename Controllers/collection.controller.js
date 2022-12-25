import Collection from "../models/collection.schema";
import asyncHandler from "../services/asyncHandler";
import customError from "../utils/customError";

export const createCollection = asyncHandler(async (req, res) => {
  //take name from frontend
  const { name } = req.body;

  if (!name) {
    throw new customError("Collection name is required", 400);
  }

  //add the name to db
  const collection = await Collection.create({
    name,
  });

  //send respond to frontend
  res.status(200).json({
    success: true,
    message: "Collection created successfully",
    collection,
  });
});

export const updateCollection = asyncHandler(async (req, res) => {
  // existiong values
  const { id: collectionId } = req.params;

  // new value
  const { name } = req.body;

  if (!name) {
    throw new customError("Collection name is required", 400);
  }

  let updatedCollection = await Collection.findByIdAndUpdate(
    collectionId,
    {
      name,
    },
    {
      new: true,
      runValidator: true,
    }
  );

  if (!updatedCollection) {
    throw new customError("Collection not found", 400);
  }

  // send response to frontend
  res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    updateCollection,
  });
});

export const deleteCollection = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;

  const collectionToDelete = await Collection.findByIdAndDelete(collectionId);

  if (!collectionToDelete) {
    throw new customError("Collection not found", 400);
  }

  collectionToDelete.remove();

  // send response to frontend
  res.status(200).json({
    success: true,
    message: "Collection deleted successfully",
  });
});

export const getAllCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find();

  if (!collections) {
    throw new customError("No collection found", 400);
  }

  // send response to frontend
  res.status(200).json({
    success: true,
    collections,
  });
});
