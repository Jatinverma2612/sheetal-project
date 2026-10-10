import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import { rebuildIndex } from "../services/ngram.search.service.js";
import { searchService } from "../services/search.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.resolve(__dirname, "../test-results/search-test-input.txt");
const OUTPUT_PATH = path.resolve(__dirname, "../test-results/search-test-report.md");
const RESULT_LIMIT = 10;

const readQueries = async () => {
  const raw = await fs.readFile(INPUT_PATH, "utf8");

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
};

const escapeCell = (value) =>
  String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .trim();

const formatResultLabel = (result) => {
  if (!result?.data) return "Unknown";

  if (result.type === "category") {
    return `Category: ${result.data.name || "Unnamed"}`;
  }

  const productName = result.data.name || "Unnamed";
  const categoryName = result.data.category?.name
    ? ` (${result.data.category.name})`
    : "";

  return `Product: ${productName}${categoryName}`;
};

const buildMarkdown = ({ generatedAt, queries, rows }) => {
  const successfulRows = rows.filter((row) => row.status === "OK");
  const failedRows = rows.filter((row) => row.status === "ERROR");
  const totalResults = successfulRows.reduce((sum, row) => sum + row.resultCount, 0);

  const lines = [
    "# Search Test Report",
    "",
    `**Generated:** ${generatedAt}`,
    `**Input file:** \`test-results/search-test-input.txt\``,
    `**Output file:** \`test-results/search-test-report.md\``,
    `**Queries tested:** ${queries.length}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---|",
    `| Total Queries | ${queries.length} |`,
    `| Successful Queries | ${successfulRows.length} |`,
    `| Failed Queries | ${failedRows.length} |`,
    `| Total Returned Results | ${totalResults} |`,
    "",
    "## Results",
    "",
    "| # | Query | Status | Time (ms) | Result Count | Top Results |",
    "|---|---|---|---:|---:|---|",
  ];

  rows.forEach((row, index) => {
    const topResults =
      row.status === "OK"
        ? row.topResults.length > 0
          ? row.topResults.join("<br>")
          : "No results"
        : escapeCell(row.error);

    lines.push(
      `| ${index + 1} | \`${escapeCell(row.query)}\` | ${row.status} | ${row.durationMs} | ${row.resultCount} | ${escapeCell(topResults)} |`,
    );
  });

  return `${lines.join("\n")}\n`;
};

const main = async () => {
  const startedAt = Date.now();

  try {
    const queries = await readQueries();

    if (queries.length === 0) {
      throw new Error(
        "No queries found in test-results/search-test-input.txt. Add one query per line.",
      );
    }

    await connectDB();
    await rebuildIndex();

    const rows = [];

    for (const query of queries) {
      const queryStartedAt = Date.now();

      try {
        const results = await searchService({
          query,
          limit: RESULT_LIMIT,
          page: 1,
        });

        rows.push({
          query,
          status: "OK",
          durationMs: Date.now() - queryStartedAt,
          resultCount: results.length,
          topResults: results.slice(0, 5).map(formatResultLabel),
          error: "",
        });
      } catch (error) {
        rows.push({
          query,
          status: "ERROR",
          durationMs: Date.now() - queryStartedAt,
          resultCount: 0,
          topResults: [],
          error: error.message,
        });
      }
    }

    const markdown = buildMarkdown({
      generatedAt: new Date().toISOString(),
      queries,
      rows,
    });

    await fs.writeFile(OUTPUT_PATH, markdown, "utf8");

    console.log(`Report written to ${OUTPUT_PATH}`);
    console.log(`Processed ${queries.length} queries in ${Date.now() - startedAt}ms`);
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
