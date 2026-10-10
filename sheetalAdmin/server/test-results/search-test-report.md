# Search Engine Test Report

**Date:** 2026-06-23T13:23:22.417Z

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 77 |
| Passed | 63 |
| Failed | 14 |
| Overall Accuracy | 81.82% |

## Results by Group

| Group | Total | Passed | Failed | Accuracy |
|-------|-------|--------|--------|----------|
| Categories | 11 | 5 | 6 | 45.45% |
| Products | 20 | 20 | 0 | 100.00% |
| Attributes | 30 | 23 | 7 | 76.67% |
| Typos | 5 | 5 | 0 | 100.00% |
| Partials | 6 | 5 | 1 | 83.33% |
| Substrings | 5 | 5 | 0 | 100.00% |

## All Test Results

| # | Group | Query | Status | Expected (count) | Returned (count) | Notes |
|---|-------|-------|--------|-----------------|-----------------|-------|
| 1 | category | `Sarees` | ✅ PASS | Onion Pink Zariwork Tissue Saree; Libas; Elegant Red Silk Saree; Aarini Saree | Aarini Saree; Elegant Red Silk Saree; Onion Pink Zariwork Tissue Saree; Libas | All 4 products returned, none extra |
| 2 | category | `Suits` | ❌ FAIL | EXTRA: Blue Printed Straight Shirt; EXTRA: Navy Blue Floral Printed Straight Kurta; EXTRA: Rajnandii | Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali Suit Set; Ziya Suit Set; Onion Pink Cotton Printed Anarkali-New Product; Blue Printed Straight Shirt *(+2 more)* | 3 unexpected products returned |
| 3 | category | `Lehenga` | ✅ PASS | RIRASA; Swapnil Lehenga | Swapnil Lehenga; RIRASA | All 2 products returned, none extra |
| 4 | category | `Kaftan` | ✅ PASS | Black & White Kaftan | Black & White Kaftan | All 1 products returned, none extra |
| 5 | category | `Dresses` | ✅ PASS | Kharakapas; Elegant Beige Flowy Mini Dress; Mustard Yellow Printed Flared Dress | Elegant Beige Flowy Mini Dress; Mustard Yellow Printed Flared Dress; Kharakapas | All 3 products returned, none extra |
| 6 | category | `Kurta Sets` | ❌ FAIL | EXTRA: Onion Pink Cotton Printed Anarkali Suit Set; EXTRA: Blue Chanderi Solid Gathered Suit Set; EXTRA: Onion Pink Cotton Printed Anarkali-New Product; EXTRA: Ziya Suit Set | Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta; Rajnandii; Onion Pink Cotton Printed Anarkali Suit Set; Blue Chanderi Solid Gathered Suit Set *(+2 more)* | 4 unexpected products returned |
| 7 | category | `test` | ❌ FAIL | EXTRA: Test Product New Excel one; EXTRA: Test Product New Excel Three; EXTRA: Test-1 Product New Excel one; EXTRA: Test-3 Product New Excel Three; EXTRA: New Product Name | Test Product New Excel one; Test Product New Excel Three; Test Product New Excel Two; Test-1 Product New Excel one; Test-2 Product New Excel *(+2 more)* | 5 unexpected products returned |
| 8 | category | `Test Category Name` | ❌ FAIL | EXTRA: Test Product New Excel Two; EXTRA: Test-2 Product New Excel; EXTRA: New Product Name | Test Product New Excel Two; Test-2 Product New Excel; Test Product New Excel one; Test Product New Excel Three; Test-1 Product New Excel one *(+2 more)* | 3 unexpected products returned |
| 9 | category | `Pant` | ✅ PASS | Tattered Jeans | Tattered Jeans | All 1 products returned, none extra |
| 10 | category | `Test Category Name New1` | ❌ FAIL | EXTRA: Test Product New Excel Two; EXTRA: Test-2 Product New Excel; EXTRA: Test Product New Excel one; EXTRA: Test Product New Excel Three; EXTRA: Test-1 Product New Excel one | Test Product New Excel Two; Test-2 Product New Excel; Test Product New Excel one; Test Product New Excel Three; Test-1 Product New Excel one *(+2 more)* | 6 unexpected products returned |
| 11 | category | `Test-mm` | ❌ FAIL | — | Test Product New Excel Two; Test-2 Product New Excel; Test Product New Excel one; Test Product New Excel Three; Test-1 Product New Excel one *(+2 more)* | 7 unexpected products returned |
| 12 | product | `Onion Pink Zariwork Tissue Saree` | ✅ PASS | Onion Pink Zariwork Tissue Saree | Onion Pink Zariwork Tissue Saree; Libas; Elegant Red Silk Saree; Aarini Saree | Product found in results |
| 13 | product | `Libas` | ✅ PASS | Libas | Libas | Product found in results |
| 14 | product | `Onion Pink Cotton Printed Anarkali Suit Set` | ✅ PASS | Onion Pink Cotton Printed Anarkali Suit Set | Onion Pink Cotton Printed Anarkali Suit Set; Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali-New Product; Ziya Suit Set; Blue Printed Straight Shirt *(+2 more)* | Product found in results |
| 15 | product | `Elegant Red Silk Saree` | ✅ PASS | Elegant Red Silk Saree | Elegant Red Silk Saree; Onion Pink Zariwork Tissue Saree; Libas; Aarini Saree | Product found in results |
| 16 | product | `Black & White Kaftan` | ✅ PASS | Black & White Kaftan | Black & White Kaftan | Product found in results |
| 17 | product | `Blue Printed Straight Shirt` | ✅ PASS | Blue Printed Straight Shirt | Blue Printed Straight Shirt | Product found in results |
| 18 | product | `Navy Blue Floral Printed Straight Kurta` | ✅ PASS | Navy Blue Floral Printed Straight Kurta | Navy Blue Floral Printed Straight Kurta; Blue Printed Straight Shirt; Rajnandii | Product found in results |
| 19 | product | `Blue Chanderi Solid Gathered Suit Set` | ✅ PASS | Blue Chanderi Solid Gathered Suit Set | Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product; Ziya Suit Set; Blue Printed Straight Shirt *(+2 more)* | Product found in results |
| 20 | product | `Kharakapas` | ✅ PASS | Kharakapas | Kharakapas | Product found in results |
| 21 | product | `Elegant Beige Flowy Mini Dress` | ✅ PASS | Elegant Beige Flowy Mini Dress | Elegant Beige Flowy Mini Dress; Kharakapas; Mustard Yellow Printed Flared Dress | Product found in results |
| 22 | product | `RIRASA` | ✅ PASS | RIRASA | RIRASA | Product found in results |
| 23 | product | `Rajnandii` | ✅ PASS | Rajnandii | Rajnandii | Product found in results |
| 24 | product | `Mustard Yellow Printed Flared Dress` | ✅ PASS | Mustard Yellow Printed Flared Dress | Mustard Yellow Printed Flared Dress; Kharakapas; Elegant Beige Flowy Mini Dress | Product found in results |
| 25 | product | `Swapnil Lehenga` | ✅ PASS | Swapnil Lehenga | Swapnil Lehenga; RIRASA | Product found in results |
| 26 | product | `Test Product New Excel one` | ✅ PASS | Test Product New Excel one | Test Product New Excel one; Test-1 Product New Excel one; Test Product New Excel Two; Test-2 Product New Excel; Test Product New Excel Three *(+2 more)* | Product found in results |
| 27 | product | `Test Product New Excel Two` | ✅ PASS | Test Product New Excel Two | Test Product New Excel Two; Test-2 Product New Excel; Test Product New Excel one; Test Product New Excel Three; Test-1 Product New Excel one *(+2 more)* | Product found in results |
| 28 | product | `Test Product New Excel Three` | ✅ PASS | Test Product New Excel Three | Test Product New Excel Three; Test-3 Product New Excel Three; Test Product New Excel Two; Test-2 Product New Excel; Test Product New Excel one *(+2 more)* | Product found in results |
| 29 | product | `Test-1 Product New Excel one` | ✅ PASS | Test-1 Product New Excel one | Test-1 Product New Excel one; Test Product New Excel Two; Test-2 Product New Excel; Test Product New Excel one; Test Product New Excel Three *(+2 more)* | Product found in results |
| 30 | product | `Test-2 Product New Excel` | ✅ PASS | Test-2 Product New Excel | Test-2 Product New Excel; Test Product New Excel Two; Test Product New Excel one; Test Product New Excel Three; Test-1 Product New Excel one *(+2 more)* | Product found in results |
| 31 | product | `Test-3 Product New Excel Three` | ✅ PASS | Test-3 Product New Excel Three | Test-3 Product New Excel Three; Test Product New Excel Two; Test-2 Product New Excel; Test Product New Excel one; Test Product New Excel Three *(+2 more)* | Product found in results |
| 32 | attribute | `Cotton` | ✅ PASS | Onion Pink Zariwork Tissue Saree; Onion Pink Cotton Printed Anarkali Suit Set; Black & White Kaftan; Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta *(+7 more)* | Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product; Kharakapas; Navy Blue Floral Printed Straight Kurta; Black & White Kaftan *(+7 more)* | recall 12/12 (100%) |
| 33 | attribute | `anniversary` | ✅ PASS | Onion Pink Zariwork Tissue Saree | Onion Pink Zariwork Tissue Saree | recall 1/1 (100%) |
| 34 | attribute | `Silk` | ✅ PASS | Libas; Elegant Red Silk Saree; RIRASA; Swapnil Lehenga; Test Product New Excel one *(+5 more)* | Elegant Red Silk Saree; Aarini Saree; Libas; Onion Pink Cotton Printed Anarkali-New Product; RIRASA *(+5 more)* | recall 10/10 (100%) |
| 35 | attribute | `cotton` | ✅ PASS | Onion Pink Zariwork Tissue Saree; Onion Pink Cotton Printed Anarkali Suit Set; Black & White Kaftan; Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta *(+7 more)* | Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product; Kharakapas; Navy Blue Floral Printed Straight Kurta; Black & White Kaftan *(+7 more)* | recall 12/12 (100%) |
| 36 | attribute | `Sharara` | ✅ PASS | Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product | Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product | recall 2/2 (100%) |
| 37 | attribute | `Mirror Work` | ✅ PASS | Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product | Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product | recall 2/2 (100%) |
| 38 | attribute | `Kurta Set` | ✅ PASS | Onion Pink Cotton Printed Anarkali Suit Set; Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta; Rajnandii; Onion Pink Cotton Printed Anarkali-New Product | Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta; Rajnandii; Onion Pink Cotton Printed Anarkali Suit Set; Blue Chanderi Solid Gathered Suit Set *(+2 more)* | recall 5/5 (100%); 2 unexpected products returned |
| 39 | attribute | `silk` | ✅ PASS | Libas; Elegant Red Silk Saree; RIRASA; Swapnil Lehenga; Test Product New Excel one *(+5 more)* | Elegant Red Silk Saree; Aarini Saree; Libas; Onion Pink Cotton Printed Anarkali-New Product; RIRASA *(+5 more)* | recall 10/10 (100%) |
| 40 | attribute | `red` | ❌ FAIL | Elegant Red Silk Saree; Blue Chanderi Solid Gathered Suit Set; RIRASA; Test Product New Excel Two; Test-2 Product New Excel *(+2 more)* | Elegant Red Silk Saree; Tattered Jeans; Blue Chanderi Solid Gathered Suit Set; Mustard Yellow Printed Flared Dress; Black & White Kaftan *(+5 more)* | recall 3/7 (43%); 7 unexpected products returned |
| 41 | attribute | `bridal` | ✅ PASS | Elegant Red Silk Saree; Swapnil Lehenga; Test Product New Excel one; Test-1 Product New Excel one; EXTRA: RIRASA | RIRASA; Swapnil Lehenga; Elegant Red Silk Saree; Test Product New Excel one; Test-1 Product New Excel one | recall 4/4 (100%); 1 unexpected products returned |
| 42 | attribute | `Festive` | ✅ PASS | Elegant Red Silk Saree; Mustard Yellow Printed Flared Dress; Swapnil Lehenga; Test Product New Excel one; Test Product New Excel Two *(+6 more)* | Ziya Suit Set; Aarini Saree; Elegant Red Silk Saree; Mustard Yellow Printed Flared Dress; Swapnil Lehenga *(+6 more)* | recall 11/11 (100%) |
| 43 | attribute | `Wedding` | ✅ PASS | Elegant Red Silk Saree; Swapnil Lehenga; Test Product New Excel one; Test Product New Excel Three; Test-1 Product New Excel one *(+2 more)* | Aarini Saree; Elegant Red Silk Saree; Swapnil Lehenga; Test Product New Excel one; Test Product New Excel Three *(+2 more)* | recall 7/7 (100%) |
| 44 | attribute | `Traditional` | ✅ PASS | Elegant Red Silk Saree; Test Product New Excel Three; Test-3 Product New Excel Three; Aarini Saree | Aarini Saree; Elegant Red Silk Saree; Test Product New Excel Three; Test-3 Product New Excel Three | recall 4/4 (100%) |
| 45 | attribute | `Zari` | ✅ PASS | Elegant Red Silk Saree; Swapnil Lehenga; Test Product New Excel one; Test Product New Excel Three; Test-1 Product New Excel one *(+2 more)* | Onion Pink Zariwork Tissue Saree; Aarini Saree; Elegant Red Silk Saree; Swapnil Lehenga; Test Product New Excel one *(+3 more)* | recall 7/7 (100%); 1 unexpected products returned |
| 46 | attribute | `Embroidery` | ✅ PASS | Elegant Red Silk Saree | Elegant Red Silk Saree | recall 1/1 (100%) |
| 47 | attribute | `Saree` | ✅ PASS | Elegant Red Silk Saree; Test Product New Excel Three; Test-3 Product New Excel Three; Aarini Saree; EXTRA: Onion Pink Zariwork Tissue Saree | Aarini Saree; Elegant Red Silk Saree; Onion Pink Zariwork Tissue Saree; Libas | recall 2/4 (50%); 2 unexpected products returned |
| 48 | attribute | `premium` | ✅ PASS | Black & White Kaftan; Rajnandii | Black & White Kaftan; Rajnandii | recall 2/2 (100%) |
| 49 | attribute | `Straight Kurta` | ✅ PASS | Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta; Rajnandii | Navy Blue Floral Printed Straight Kurta; Blue Printed Straight Shirt; Rajnandii | recall 3/3 (100%) |
| 50 | attribute | `Office` | ✅ PASS | Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta; Mustard Yellow Printed Flared Dress; EXTRA: Blue Chanderi Solid Gathered Suit Set; EXTRA: Onion Pink Cotton Printed Anarkali-New Product | Blue Chanderi Solid Gathered Suit Set; Blue Printed Straight Shirt; Onion Pink Cotton Printed Anarkali-New Product; Navy Blue Floral Printed Straight Kurta; Mustard Yellow Printed Flared Dress *(+1 more)* | recall 3/3 (100%); 3 unexpected products returned |
| 51 | attribute | `Kurta Sets` | ❌ FAIL | Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta; Rajnandii; EXTRA: Onion Pink Cotton Printed Anarkali Suit Set; EXTRA: Blue Chanderi Solid Gathered Suit Set | Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta; Rajnandii; Onion Pink Cotton Printed Anarkali Suit Set; Blue Chanderi Solid Gathered Suit Set *(+2 more)* | recall 3/3 (100%); 4 unexpected products returned |
| 52 | attribute | `chanderi` | ✅ PASS | Blue Chanderi Solid Gathered Suit Set; Test Product New Excel Two; Test-2 Product New Excel; Onion Pink Cotton Printed Anarkali-New Product; Ziya Suit Set | Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali-New Product; Test Product New Excel Two; Test-2 Product New Excel; Ziya Suit Set | recall 5/5 (100%) |
| 53 | attribute | `Straight Cut` | ✅ PASS | Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali-New Product | Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali-New Product | recall 2/2 (100%) |
| 54 | attribute | `Embroidered` | ✅ PASS | Blue Chanderi Solid Gathered Suit Set; RIRASA; Test Product New Excel Two; Test-2 Product New Excel; Onion Pink Cotton Printed Anarkali-New Product *(+1 more)* | Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali-New Product; RIRASA; Test Product New Excel Two; Test-2 Product New Excel *(+1 more)* | recall 6/6 (100%) |
| 55 | attribute | `Anarkali set` | ❌ FAIL | Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali-New Product; EXTRA: Onion Pink Cotton Printed Anarkali Suit Set; EXTRA: Ziya Suit Set; EXTRA: Blue Printed Straight Shirt | Onion Pink Cotton Printed Anarkali Suit Set; Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali-New Product; Ziya Suit Set; Blue Printed Straight Shirt *(+2 more)* | recall 2/2 (100%); 5 unexpected products returned |
| 56 | attribute | `dress` | ❌ FAIL | Kharakapas; EXTRA: Elegant Beige Flowy Mini Dress; EXTRA: Mustard Yellow Printed Flared Dress | Elegant Beige Flowy Mini Dress; Mustard Yellow Printed Flared Dress; Kharakapas | recall 1/1 (100%); 2 unexpected products returned |
| 57 | attribute | `long dress` | ❌ FAIL | Kharakapas; EXTRA: RIRASA; EXTRA: Swapnil Lehenga; EXTRA: Elegant Beige Flowy Mini Dress; EXTRA: Mustard Yellow Printed Flared Dress | RIRASA; Swapnil Lehenga; Kharakapas; Elegant Beige Flowy Mini Dress; Mustard Yellow Printed Flared Dress | recall 1/1 (100%); 4 unexpected products returned |
| 58 | attribute | `long` | ❌ FAIL | Kharakapas; EXTRA: Swapnil Lehenga; EXTRA: RIRASA | Swapnil Lehenga; RIRASA | recall 0/1 (0%); 2 unexpected products returned |
| 59 | attribute | `Flower` | ✅ PASS | Kharakapas; EXTRA: Elegant Beige Flowy Mini Dress | Elegant Beige Flowy Mini Dress; Kharakapas | recall 1/1 (100%); 1 unexpected products returned |
| 60 | attribute | `Long Dress` | ❌ FAIL | Kharakapas; EXTRA: RIRASA; EXTRA: Swapnil Lehenga; EXTRA: Elegant Beige Flowy Mini Dress; EXTRA: Mustard Yellow Printed Flared Dress | RIRASA; Swapnil Lehenga; Kharakapas; Elegant Beige Flowy Mini Dress; Mustard Yellow Printed Flared Dress | recall 1/1 (100%); 4 unexpected products returned |
| 61 | attribute | `Flared` | ✅ PASS | RIRASA; EXTRA: Mustard Yellow Printed Flared Dress | Mustard Yellow Printed Flared Dress; RIRASA | recall 1/1 (100%); 1 unexpected products returned |
| 62 | typo | `soot (→ "suit")` | ✅ PASS | Onion Pink Cotton Printed Anarkali Suit Set; Blue Chanderi Solid Gathered Suit Set; Ziya Suit Set | Onion Pink Cotton Printed Anarkali Suit Set; Blue Chanderi Solid Gathered Suit Set; Onion Pink Cotton Printed Anarkali-New Product; Ziya Suit Set; Blue Printed Straight Shirt *(+2 more)* | At least one "suit" product returned |
| 63 | typo | `shrt (→ "shirt")` | ✅ PASS | Blue Printed Straight Shirt | Blue Printed Straight Shirt | At least one "shirt" product returned |
| 64 | typo | `lehengaa (→ "lehenga")` | ✅ PASS | Swapnil Lehenga | Swapnil Lehenga; RIRASA | At least one "lehenga" product returned |
| 65 | typo | `kurtaa (→ "kurta")` | ✅ PASS | Navy Blue Floral Printed Straight Kurta | Navy Blue Floral Printed Straight Kurta; Blue Printed Straight Shirt; Rajnandii | At least one "kurta" product returned |
| 66 | typo | `dres (→ "dress")` | ✅ PASS | Elegant Beige Flowy Mini Dress; Mustard Yellow Printed Flared Dress | Elegant Beige Flowy Mini Dress; Mustard Yellow Printed Flared Dress; Kharakapas | At least one "dress" product returned |
| 67 | partial | `cot` | ✅ PASS | — | Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product | 2 results returned |
| 68 | partial | `silk` | ✅ PASS | — | Elegant Red Silk Saree; Aarini Saree; Libas; Onion Pink Cotton Printed Anarkali-New Product; RIRASA *(+5 more)* | 10 results returned |
| 69 | partial | `linen` | ❌ FAIL | — | — | No results for partial query |
| 70 | partial | `party` | ✅ PASS | — | Test Product New Excel Two; Test-2 Product New Excel; Ziya Suit Set; New Product Name | 4 results returned |
| 71 | partial | `wedding` | ✅ PASS | — | Aarini Saree; Elegant Red Silk Saree; Swapnil Lehenga; Test Product New Excel one; Test Product New Excel Three *(+2 more)* | 7 results returned |
| 72 | partial | `casual` | ✅ PASS | — | Mustard Yellow Printed Flared Dress; Onion Pink Cotton Printed Anarkali Suit Set; Navy Blue Floral Printed Straight Kurta; Libas; New Product Name *(+2 more)* | 7 results returned |
| 73 | substring | `print` | ✅ PASS | Onion Pink Cotton Printed Anarkali Suit Set; Blue Printed Straight Shirt; Navy Blue Floral Printed Straight Kurta; Mustard Yellow Printed Flared Dress; Onion Pink Cotton Printed Anarkali-New Product | Blue Printed Straight Shirt; Mustard Yellow Printed Flared Dress; Navy Blue Floral Printed Straight Kurta; Onion Pink Cotton Printed Anarkali Suit Set; Onion Pink Cotton Printed Anarkali-New Product | 5 products returned (5 expected) |
| 74 | substring | `embroid` | ✅ PASS | — | — | 0 products returned (0 expected) |
| 75 | substring | `floral` | ✅ PASS | Navy Blue Floral Printed Straight Kurta | Navy Blue Floral Printed Straight Kurta | 1 products returned (1 expected) |
| 76 | substring | `georget` | ✅ PASS | — | — | 0 products returned (0 expected) |
| 77 | substring | `chiffon` | ✅ PASS | — | — | 0 products returned (0 expected) |

## Failed Tests (14)

| Group | Query | Expected | Returned | Reason |
|-------|-------|----------|----------|--------|
| category | `Suits` | EXTRA: Blue Printed Straight Shirt, EXTRA: Navy Blue Floral Printed Straight Kurta, EXTRA: Rajnandii | Blue Chanderi Solid Gathered Suit Set, Onion Pink Cotton Printed Anarkali Suit Set, Ziya Suit Set, Onion Pink Cotton Printed Anarkali-New Product, Blue Printed Straight Shirt *(+2 more)* | 3 unexpected products returned |
| category | `Kurta Sets` | EXTRA: Onion Pink Cotton Printed Anarkali Suit Set, EXTRA: Blue Chanderi Solid Gathered Suit Set, EXTRA: Onion Pink Cotton Printed Anarkali-New Product, EXTRA: Ziya Suit Set | Blue Printed Straight Shirt, Navy Blue Floral Printed Straight Kurta, Rajnandii, Onion Pink Cotton Printed Anarkali Suit Set, Blue Chanderi Solid Gathered Suit Set *(+2 more)* | 4 unexpected products returned |
| category | `test` | EXTRA: Test Product New Excel one, EXTRA: Test Product New Excel Three, EXTRA: Test-1 Product New Excel one, EXTRA: Test-3 Product New Excel Three, EXTRA: New Product Name | Test Product New Excel one, Test Product New Excel Three, Test Product New Excel Two, Test-1 Product New Excel one, Test-2 Product New Excel *(+2 more)* | 5 unexpected products returned |
| category | `Test Category Name` | EXTRA: Test Product New Excel Two, EXTRA: Test-2 Product New Excel, EXTRA: New Product Name | Test Product New Excel Two, Test-2 Product New Excel, Test Product New Excel one, Test Product New Excel Three, Test-1 Product New Excel one *(+2 more)* | 3 unexpected products returned |
| category | `Test Category Name New1` | EXTRA: Test Product New Excel Two, EXTRA: Test-2 Product New Excel, EXTRA: Test Product New Excel one, EXTRA: Test Product New Excel Three, EXTRA: Test-1 Product New Excel one | Test Product New Excel Two, Test-2 Product New Excel, Test Product New Excel one, Test Product New Excel Three, Test-1 Product New Excel one *(+2 more)* | 6 unexpected products returned |
| category | `Test-mm` | EXTRA: Test Product New Excel Two, EXTRA: Test-2 Product New Excel, EXTRA: Test Product New Excel one, EXTRA: Test Product New Excel Three, EXTRA: Test-1 Product New Excel one | Test Product New Excel Two, Test-2 Product New Excel, Test Product New Excel one, Test Product New Excel Three, Test-1 Product New Excel one *(+2 more)* | 7 unexpected products returned |
| attribute | `red` | Elegant Red Silk Saree, Blue Chanderi Solid Gathered Suit Set, RIRASA, Test Product New Excel Two, Test-2 Product New Excel *(+2 more)* | Elegant Red Silk Saree, Tattered Jeans, Blue Chanderi Solid Gathered Suit Set, Mustard Yellow Printed Flared Dress, Black & White Kaftan *(+5 more)* | recall 3/7 (43%); 7 unexpected products returned |
| attribute | `Kurta Sets` | Blue Printed Straight Shirt, Navy Blue Floral Printed Straight Kurta, Rajnandii, EXTRA: Onion Pink Cotton Printed Anarkali Suit Set, EXTRA: Blue Chanderi Solid Gathered Suit Set | Blue Printed Straight Shirt, Navy Blue Floral Printed Straight Kurta, Rajnandii, Onion Pink Cotton Printed Anarkali Suit Set, Blue Chanderi Solid Gathered Suit Set *(+2 more)* | recall 3/3 (100%); 4 unexpected products returned |
| attribute | `Anarkali set` | Blue Chanderi Solid Gathered Suit Set, Onion Pink Cotton Printed Anarkali-New Product, EXTRA: Onion Pink Cotton Printed Anarkali Suit Set, EXTRA: Ziya Suit Set, EXTRA: Blue Printed Straight Shirt | Onion Pink Cotton Printed Anarkali Suit Set, Blue Chanderi Solid Gathered Suit Set, Onion Pink Cotton Printed Anarkali-New Product, Ziya Suit Set, Blue Printed Straight Shirt *(+2 more)* | recall 2/2 (100%); 5 unexpected products returned |
| attribute | `dress` | Kharakapas, EXTRA: Elegant Beige Flowy Mini Dress, EXTRA: Mustard Yellow Printed Flared Dress | Elegant Beige Flowy Mini Dress, Mustard Yellow Printed Flared Dress, Kharakapas | recall 1/1 (100%); 2 unexpected products returned |
| attribute | `long dress` | Kharakapas, EXTRA: RIRASA, EXTRA: Swapnil Lehenga, EXTRA: Elegant Beige Flowy Mini Dress, EXTRA: Mustard Yellow Printed Flared Dress | RIRASA, Swapnil Lehenga, Kharakapas, Elegant Beige Flowy Mini Dress, Mustard Yellow Printed Flared Dress | recall 1/1 (100%); 4 unexpected products returned |
| attribute | `long` | Kharakapas, EXTRA: Swapnil Lehenga, EXTRA: RIRASA | Swapnil Lehenga, RIRASA | recall 0/1 (0%); 2 unexpected products returned |
| attribute | `Long Dress` | Kharakapas, EXTRA: RIRASA, EXTRA: Swapnil Lehenga, EXTRA: Elegant Beige Flowy Mini Dress, EXTRA: Mustard Yellow Printed Flared Dress | RIRASA, Swapnil Lehenga, Kharakapas, Elegant Beige Flowy Mini Dress, Mustard Yellow Printed Flared Dress | recall 1/1 (100%); 4 unexpected products returned |
| partial | `linen` | — | — | No results for partial query |
