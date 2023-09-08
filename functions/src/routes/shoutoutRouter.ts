import express from "express";
import { getClient } from "../db";
import Shoutout from "../models/Shoutout";
import { ObjectId } from "mongodb";

const shoutoutRouter = express.Router();

// call within try/catch to catch and log any errors
const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

// get all Shoutouts
shoutoutRouter.get("/shoutouts", async (req, res) => {
  try {
    const client = await getClient();
    const cursor = client.db().collection<Shoutout>("shoutouts").find();
    const results = await cursor.toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

// get Shoutout by User
shoutoutRouter.get("/shoutouts/:name", async (req, res) => {
  const name = req.params.name;
  try {
    const client = await getClient();
    const shoutouts: Shoutout[] = await client
      .db()
      .collection<Shoutout>("shoutouts")
      .find({ to: name })
      .toArray();
    if (shoutouts) {
      res.status(200).json(shoutouts);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

// // create new Shoutout
shoutoutRouter.post("/shoutouts", async (req, res) => {
  const shoutout: Shoutout = req.body;
  try {
    const client = await getClient();
    await client.db().collection<Shoutout>("shoutouts").insertOne(shoutout);
    res.status(201).json(shoutout);
  } catch (err) {
    errorResponse(err, res);
  }
});

// // delete Shoutout by ID
shoutoutRouter.delete("/shoutouts/:id", async (req, res) => {
  const _id = new ObjectId(req.params.id);
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Shoutout>("shoutouts")
      .deleteOne({ _id });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Not Found" });
    } else {
      res.status(204).end();
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

// // replace / update Shoutout by ID
shoutoutRouter.put("/shoutouts/:id", async (req, res) => {
  const _id = new ObjectId(req.params.id);
  const update: Shoutout = req.body;
  delete update._id; // remove _id from body so we only have one.
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Shoutout>("shoutouts")
      .replaceOne({ _id }, update);
    if (result.modifiedCount) {
      update._id = _id;
      res.status(200).json(update);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

export default shoutoutRouter;
