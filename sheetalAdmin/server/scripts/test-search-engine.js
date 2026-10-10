import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { searchService } from "../services/search.service.js";
import { rebuildIndex } from "../services/ngram.search.service.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "../.env");
dotenv.config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI is missing in .env!");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Result tracking — every test is recorded, not just failures
// ---------------------------------------------------------------------------

const testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  categories: { total: 0, passed: 0, failed: 0 },
  products:   { total: 0, passed: 0, failed: 0 },
  attributes: { total: 0, passed: 0, failed: 0 },
  typos:      { total: 0, passed: 0, failed: 0 },
  partials:   { total: 0, passed: 0, failed: 0 },
  substrings: { total: 0, passed: 0, failed: 0 },
  /** Full log of every test that was run */
  allTests: [],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildNameMap(products) {
  const map = {};
  for (const p of products) map[p._id.toString()] = p.name;
  return map;
}

function idToName(id, nameMap) {
  return nameMap[id] || id;
}

function log(message) {
  console.log(message);
}

/**
 * Record a single test outcome.
 *
 * @param {object} opts
 * @param {string}   opts.group        - "category" | "product" | "attribute" | "typo" | "partial" | "substring"
 * @param {string}   opts.query        - the search query that was run
 * @param {boolean}  opts.passed       - whether the test passed
 * @param {string[]} opts.expectedNames - up to 5 representative expected names
 * @param {number}   opts.expectedCount - total number of expected items
 * @param {string[]} opts.returnedNames - up to 5 returned product names
 * @param {number}   opts.returnedCount - total number of returned items
 * @param {string}   opts.reason       - human-readable pass/fail description
 */
// Maps the group name used in recordTest() → the key in testResults
const GROUP_KEY_MAP = {
  category:  "categories",
  product:   "products",
  attribute: "attributes",
  typo:      "typos",
  partial:   "partials",
  substring: "substrings",
};

function recordTest({
  group,
  query,
  passed,
  expectedNames = [],
  expectedCount = 0,
  returnedNames = [],
  returnedCount = 0,
  reason = "",
}) {
  const key = GROUP_KEY_MAP[group];
  testResults.totalTests++;
  if (key) testResults[key].total++;

  if (passed) {
    testResults.passedTests++;
    if (key) testResults[key].passed++;
  } else {
    testResults.failedTests++;
    if (key) testResults[key].failed++;
  }

  testResults.allTests.push({
    group,
    query,
    passed,
    expectedNames: expectedNames.slice(0, 5),
    expectedCount,
    returnedNames: returnedNames.slice(0, 5),
    returnedCount,
    reason,
  });
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

async function connectDB() {
  await mongoose.connect(MONGO_URI);
  log("MongoDB Connected");
}

async function disconnectDB() {
  await mongoose.disconnect();
  log("MongoDB Disconnected");
}

async function fetchTestData() {
  const [products, categories] = await Promise.all([
    Product.find({ status: "Active" }).populate("category", "name slug").lean(),
    Category.find({ status: "Active" }).lean(),
  ]);
  return { products, categories };
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

async function testGetCategoryAccuracy(testData) {
  log("\n=== Testing Category Search Accuracy ===");
  const { products, categories } = testData;
  const nameMap = buildNameMap(products);

  for (const category of categories) {
    const query = category.name;

    const expectedProducts = products.filter(
      (p) => p.category?._id?.toString() === category._id.toString()
    );
    const expectedIds   = expectedProducts.map((p) => p._id.toString());
    const expectedNames = expectedProducts.map((p) => p.name);

    const results        = await searchService({ query });
    const productResults = results.filter((r) => r.type === "product");
    const returnedIds    = productResults.map((r) => r.data._id.toString());
    const returnedNames  = productResults.map((r) => r.data.name || idToName(r.data._id.toString(), nameMap));

    const expectedIdSet = new Set(expectedIds);
    const missingIds    = expectedIds.filter((id) => !returnedIds.includes(id));
    const missingNames  = missingIds.map((id) => idToName(id, nameMap));
    const extraIds      = returnedIds.filter((id) => !expectedIdSet.has(id));
    const extraNames    = extraIds.map((id) => idToName(id, nameMap));

    const hasMissing = missingIds.length > 0 || (expectedIds.length > 0 && returnedIds.length === 0);
    const hasExtra   = extraIds.length > 0;
    const passed     = !hasMissing && !hasExtra;

    let reason;
    if (passed) {
      reason = `All ${expectedIds.length} products returned, none extra`;
    } else {
      const parts = [];
      if (hasMissing) parts.push(`missing ${missingIds.length}/${expectedIds.length}`);
      if (hasExtra)   parts.push(`${extraIds.length} unexpected products returned`);
      reason = parts.join("; ");
    }

    recordTest({
      group: "category",
      query,
      passed,
      expectedNames: passed ? expectedNames : [...missingNames, ...extraNames.map((n) => `EXTRA: ${n}`)],
      expectedCount: expectedIds.length,
      returnedNames,
      returnedCount: returnedIds.length,
      reason,
    });
  }
}

async function testExactProductNames(testData) {
  log("\n=== Testing Exact Product Name Searches ===");
  const { products } = testData;

  for (const product of products.slice(0, 20)) {
    const query   = product.name;
    const results = await searchService({ query });

    const productResults = results.filter((r) => r.type === "product");
    const returnedNames  = productResults.map((r) => r.data.name || r.data._id.toString());
    const found = productResults.some(
      (r) => r.data._id.toString() === product._id.toString()
    );

    recordTest({
      group: "product",
      query,
      passed: found,
      expectedNames: [product.name],
      expectedCount: 1,
      returnedNames,
      returnedCount: productResults.length,
      reason: found
        ? "Product found in results"
        : "Exact product name not found in results",
    });
  }
}

async function testAttributeSearches(testData) {
  log("\n=== Testing Tag/Fabric/Occasion Search Accuracy ===");
  const { products } = testData;

  const attributeValues = new Set();
  for (const product of products) {
    ["tags", "fabric", "occasion", "style", "work", "productType"].forEach((field) => {
      if (Array.isArray(product[field])) product[field].forEach((v) => attributeValues.add(v));
    });
  }

  const uniqueAttributes = [...attributeValues].filter((v) => v.length > 2);

  for (const attrValue of uniqueAttributes.slice(0, 30)) {
    const expectedProducts = products.filter((p) =>
      ["tags", "fabric", "occasion", "style", "work", "productType"].some(
        (field) =>
          Array.isArray(p[field]) &&
          p[field].some((v) => v.toLowerCase().includes(attrValue.toLowerCase()))
      )
    );

    if (expectedProducts.length === 0) continue;

    const expectedIds   = expectedProducts.map((p) => p._id.toString());
    const expectedNames = expectedProducts.map((p) => p.name);

    const results        = await searchService({ query: attrValue });
    const productResults = results.filter((r) => r.type === "product");
    const returnedIds    = productResults.map((r) => r.data._id.toString());
    const returnedNames  = productResults.map((r) => r.data.name || r.data._id.toString());

    const expectedIdSet  = new Set(expectedIds);
    const foundCount     = expectedIds.filter((id) => returnedIds.includes(id)).length;
    const extraIds       = returnedIds.filter((id) => !expectedIdSet.has(id));
    const extraNames     = extraIds.map((id) => {
      const hit = productResults.find((r) => r.data._id.toString() === id);
      return hit?.data?.name || id;
    });

    const recall     = foundCount / expectedIds.length;           // how many expected were found
    const precision  = returnedIds.length > 0
      ? foundCount / returnedIds.length                           // how many returned were correct
      : 0;

    // Fail if recall < 50% OR precision < 50% (too many unrelated products returned)
    const passed = recall >= 0.5 && precision >= 0.5;

    const parts = [`recall ${foundCount}/${expectedIds.length} (${Math.round(recall * 100)}%)`];
    if (extraIds.length > 0)
      parts.push(`${extraIds.length} unexpected products returned`);

    recordTest({
      group: "attribute",
      query: attrValue,
      passed,
      expectedNames: extraIds.length > 0
        ? [...expectedNames, ...extraNames.map((n) => `EXTRA: ${n}`)]
        : expectedNames,
      expectedCount: expectedIds.length,
      returnedNames,
      returnedCount: returnedIds.length,
      reason: parts.join("; "),
    });
  }
}

async function testTypos(testData) {
  log("\n=== Testing Typo Tolerance ===");
  const { products } = testData;

  const typoMap = {
    suts:     "suits",
    soot:     "suit",
    shrt:     "shirt",
    saarees:  "sarees",
    sareez:   "sarees",
    lehengaa: "lehenga",
    kurtaa:   "kurta",
    dres:     "dress",
  };

  for (const [typo, correct] of Object.entries(typoMap)) {
    const matchingProducts = products.filter((p) =>
      p.name.toLowerCase().includes(correct.toLowerCase())
    );

    if (matchingProducts.length === 0) continue;

    const results        = await searchService({ query: typo });
    const productResults = results.filter((r) => r.type === "product");
    const returnedIds    = new Set(productResults.map((r) => r.data._id.toString()));
    const returnedNames  = productResults.map((r) => r.data.name || r.data._id.toString());

    const foundMatching = matchingProducts.some((p) => returnedIds.has(p._id.toString()));

    recordTest({
      group: "typo",
      query: `${typo} (→ "${correct}")`,
      passed: foundMatching,
      expectedNames: matchingProducts.map((p) => p.name),
      expectedCount: matchingProducts.length,
      returnedNames,
      returnedCount: productResults.length,
      reason: foundMatching
        ? `At least one "${correct}" product returned`
        : `No "${correct}" products found for typo "${typo}"`,
    });
  }
}

async function testPartialMatches(testData) {
  log("\n=== Testing Partial Matches ===");

  const partialQueries = ["cot", "silk", "linen", "party", "wedding", "casual"];

  for (const query of partialQueries) {
    const results    = await searchService({ query });
    const hasResults = results.length > 0;
    const returnedNames = results
      .filter((r) => r.type === "product")
      .map((r) => r.data.name || r.data._id?.toString())
      .slice(0, 5);

    recordTest({
      group: "partial",
      query,
      passed: hasResults,
      expectedNames: [],
      expectedCount: 0,
      returnedNames,
      returnedCount: results.length,
      reason: hasResults
        ? `${results.length} results returned`
        : "No results for partial query",
    });
  }
}

async function testSubstrings(testData) {
  log("\n=== Testing Substring Searches ===");
  const { products } = testData;

  const substrings = ["print", "embroid", "floral", "georget", "chiffon"];

  for (const substr of substrings) {
    const expectedProducts = products.filter((p) =>
      p.name.toLowerCase().includes(substr.toLowerCase())
    );

    const results        = await searchService({ query: substr });
    const productResults = results.filter((r) => r.type === "product");
    const returnedNames  = productResults.map((r) => r.data.name || r.data._id?.toString());

    const passed = !(expectedProducts.length > 0 && productResults.length === 0);

    recordTest({
      group: "substring",
      query: substr,
      passed,
      expectedNames: expectedProducts.map((p) => p.name),
      expectedCount: expectedProducts.length,
      returnedNames,
      returnedCount: productResults.length,
      reason: passed
        ? `${productResults.length} products returned (${expectedProducts.length} expected)`
        : "Substring query returned no products",
    });
  }
}

// ---------------------------------------------------------------------------
// Report generation — logs EVERY test
// ---------------------------------------------------------------------------

function generateMarkdownReport() {
  const accuracy =
    testResults.totalTests > 0
      ? ((testResults.passedTests / testResults.totalTests) * 100).toFixed(2)
      : "0.00";

  let md = `# Search Engine Test Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n\n`;

  // ── Summary ───────────────────────────────────────────────────────────────
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Tests | ${testResults.totalTests} |\n`;
  md += `| Passed | ${testResults.passedTests} |\n`;
  md += `| Failed | ${testResults.failedTests} |\n`;
  md += `| Overall Accuracy | ${accuracy}% |\n\n`;

  // ── Results by group ──────────────────────────────────────────────────────
  md += `## Results by Group\n\n`;
  md += `| Group | Total | Passed | Failed | Accuracy |\n`;
  md += `|-------|-------|--------|--------|----------|\n`;

  const groups = [
    { name: "Categories", key: "categories" },
    { name: "Products",   key: "products" },
    { name: "Attributes", key: "attributes" },
    { name: "Typos",      key: "typos" },
    { name: "Partials",   key: "partials" },
    { name: "Substrings", key: "substrings" },
  ];

  for (const g of groups) {
    const d   = testResults[g.key];
    // categories are stored under a non-standard key — fall back gracefully
    if (!d) continue;
    const acc = d.total > 0 ? ((d.passed / d.total) * 100).toFixed(2) : "0";
    md += `| ${g.name} | ${d.total} | ${d.passed} | ${d.failed} | ${acc}% |\n`;
  }

  // ── Full test log (every test, pass AND fail) ─────────────────────────────
  md += `\n## All Test Results\n\n`;
  md += `| # | Group | Query | Status | Expected (count) | Returned (count) | Notes |\n`;
  md += `|---|-------|-------|--------|-----------------|-----------------|-------|\n`;

  testResults.allTests.forEach((t, i) => {
    const status = t.passed ? "✅ PASS" : "❌ FAIL";

    const expectedCell = t.expectedCount === 0
      ? "—"
      : t.expectedNames.length > 0
        ? `${t.expectedNames.join("; ")}${t.expectedCount > 5 ? ` *(+${t.expectedCount - 5} more)*` : ""}`
        : `*(${t.expectedCount} items)*`;

    const returnedCell = t.returnedCount === 0
      ? "—"
      : t.returnedNames.length > 0
        ? `${t.returnedNames.join("; ")}${t.returnedCount > 5 ? ` *(+${t.returnedCount - 5} more)*` : ""}`
        : `*(${t.returnedCount} items)*`;

    md += `| ${i + 1} | ${t.group} | \`${t.query}\` | ${status} | ${expectedCell} | ${returnedCell} | ${t.reason} |\n`;
  });

  // ── Failed tests only (quick-scan section) ────────────────────────────────
  const failedTests = testResults.allTests.filter((t) => !t.passed);
  if (failedTests.length > 0) {
    md += `\n## Failed Tests (${failedTests.length})\n\n`;
    md += `| Group | Query | Expected | Returned | Reason |\n`;
    md += `|-------|-------|----------|----------|--------|\n`;

    for (const t of failedTests) {
      const expectedPreview = t.expectedCount > 5
        ? `${t.expectedNames.join(", ")} *(+${t.expectedCount - 5} more)*`
        : t.expectedNames.join(", ") || "—";

      const returnedPreview = t.returnedCount > 5
        ? `${t.returnedNames.join(", ")} *(+${t.returnedCount - 5} more)*`
        : t.returnedNames.join(", ") || "—";

      md += `| ${t.group} | \`${t.query}\` | ${expectedPreview} | ${returnedPreview} | ${t.reason} |\n`;
    }
  }

  return md;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function runTests() {
  log("Starting Search Engine Tests...");

  await connectDB();
  await rebuildIndex();

  const testData = await fetchTestData();
  log(`Loaded ${testData.products.length} products and ${testData.categories.length} categories`);

  await testGetCategoryAccuracy(testData);
  await testExactProductNames(testData);
  await testAttributeSearches(testData);
  await testTypos(testData);
  await testPartialMatches(testData);
  await testSubstrings(testData);

  await disconnectDB();

  const report    = generateMarkdownReport();
  const fs        = await import("fs");
  const outputDir = path.join(__dirname, "../test-results");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, "search-test-report.md");
  fs.writeFileSync(outputPath, report);
  log(`\nReport saved to: ${outputPath}`);

  log("\n=== Final Results ===");
  log(`Total: ${testResults.totalTests}, Passed: ${testResults.passedTests}, Failed: ${testResults.failedTests}`);
}

runTests().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});