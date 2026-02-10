import fs from "fs";
import path from "path";

const COUNTER_FILE = path.join(process.cwd(), "data", "order-counter.json");

interface CounterData {
  lastDate: string;
  counter: number;
}

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(COUNTER_FILE)) {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ lastDate: "", counter: 0 }));
  }
}

function getCounterData(): CounterData {
  ensureDataDir();
  try {
    const data = fs.readFileSync(COUNTER_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { lastDate: "", counter: 0 };
  }
}

function saveCounterData(data: CounterData) {
  ensureDataDir();
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(data, null, 2));
}

/**
 * Generate Order ID in format: TB + DDMMYY + 5-digit sequence
 * Example: TB0202250001
 */
export function generateOrderId(): string {
  const now = new Date();

  // Format: DDMMYY
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const dateStr = `${day}${month}${year}`;

  // Get current counter
  const counterData = getCounterData();

  let newCounter: number;

  // If same date, increment counter; otherwise reset to 1
  if (counterData.lastDate === dateStr) {
    newCounter = counterData.counter + 1;
  } else {
    newCounter = 1;
  }

  // Save new counter
  saveCounterData({
    lastDate: dateStr,
    counter: newCounter,
  });

  // Format: TB + DDMMYY + 5-digit number (padded with zeros)
  const orderNumber = String(newCounter).padStart(5, "0");

  return `TB${dateStr}${orderNumber}`;
}

/**
 * Parse order ID to get date and sequence
 */
export function parseOrderId(orderId: string): { date: string; sequence: number } | null {
  const match = orderId.match(/^TB(\d{6})(\d{5})$/);
  if (!match || !match[1] || !match[2]) return null;

  const dateStr = match[1];
  const sequence = parseInt(match[2], 10);

  const day = dateStr.slice(0, 2);
  const month = dateStr.slice(2, 4);
  const year = `20${dateStr.slice(4, 6)}`;

  return {
    date: `${day}/${month}/${year}`,
    sequence,
  };
}
