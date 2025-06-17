// server/models/asset.js

import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  depreciationMethod: {
    type: String,
    required: true,
  },
  usefulLife: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  // ← Add this field:
  archived: {
    type: Boolean,
    default: false,
  },
});

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
