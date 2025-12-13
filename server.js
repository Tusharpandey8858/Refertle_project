import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_FILE = path.join(process.cwd(), "referrals.json");

const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    return [];
  }

  const content = fs.readFileSync(DATA_FILE, "utf-8").trim();

  if (!content) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    return [];
  }

  try {
    return JSON.parse(content);
  } catch (err) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    return [];
  }
};


const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

app.post("/referral-track", (req, res) => {
    const { userId, source, campaignId, timestamp } = req.body;

    if (!userId || !source || !campaignId || !timestamp) {
        return res.status(400).json({
            status: "error",
            message: "All fields are required"
        });
    }

    if (typeof userId !== "string" ||
        typeof source !== "string" ||
        typeof campaignId !== "string") {
        return res.status(400).json({
            status: "error",
            message: "Invalid data types"
        });
    }

    const parsedTime = new Date(timestamp);
    if (isNaN(parsedTime.getTime())) {
        return res.status(400).json({
            status: "error",
            message: "Invalid timestamp format"
        });
    }


    const existingData = readData();

    const record = {
        userId,
        source,
        campaignId,
        timestamp,
        receivedAt: new Date().toISOString()
    };

    existingData.push(record);
    writeData(existingData);

    res.status(201).json({
        status: "success",
        stored: true,
        receivedAt: record.receivedAt
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

