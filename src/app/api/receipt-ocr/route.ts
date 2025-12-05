import { NextRequest, NextResponse } from "next/server";

/**
 * ULTRA-FAST OCR using OCR.space API
 * Free tier: 25,000 requests/month
 * Response time: 1-2 seconds
 * Accuracy: 95%+
 */

const OCR_API_KEY = process.env.OCR_SPACE_API_KEY || "K87899142388957"; // Free public key

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("[OCR] Processing:", image.name, "Size:", image.size);

    const startTime = Date.now();

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Call OCR.space API
    const ocrFormData = new FormData();
    ocrFormData.append('base64Image', `data:${image.type};base64,${base64}`);
    ocrFormData.append('apikey', OCR_API_KEY);
    ocrFormData.append('language', 'eng');
    ocrFormData.append('isOverlayRequired', 'false');
    ocrFormData.append('detectOrientation', 'true');
    ocrFormData.append('scale', 'true');
    ocrFormData.append('OCREngine', '2'); // Engine 2 is faster

    console.log("[OCR] Calling OCR.space API...");

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: ocrFormData,
    });

    const ocrResult = await ocrResponse.json();
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`[OCR] Completed in ${processingTime}s`);

    if (!ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
      throw new Error("No text extracted from image");
    }

    const extractedText = ocrResult.ParsedResults[0].ParsedText;
    console.log("[OCR] Extracted text:", extractedText.slice(0, 200));

    // Parse the extracted text
    const result = intelligentParse(extractedText);

    return NextResponse.json({
      ...result,
      processingTime: `${processingTime}s`,
      ocrEngine: "OCR.space"
    });

  } catch (error) {
    console.error("[OCR] Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process receipt",
        message: "❌ Could not read the image. Please ensure it's a clear photo of a receipt."
      },
      { status: 500 }
    );
  }
}

/**
 * Intelligent parser - extracts amount, date, merchant, category, description
 */
function intelligentParse(text: string) {
  const textLower = text.toLowerCase();
  const lines = text.split(/[\r\n]+/).filter(l => l.trim().length > 0);
  
  console.log("[Parser] Analyzing", lines.length, "lines");

  // ==================== AMOUNT EXTRACTION ====================
  let amount = 0;
  let amountLine = "";
  
  // Priority 1: Lines with "total" keywords - look for the LAST occurrence (usually the final total)
  const totalLines: Array<{line: string, amount: number, priority: number}> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    let priority = 0;
    
    // Highest priority: "total amount due", "total cost", "amount due", "grand total"
    if (lower.match(/\b(total\s+amount\s+due|total\s+cost|amount\s+due|grand\s+total)\b/)) {
      priority = 10;
    }
    // High priority: just "total" (but prefer lines near the end)
    else if (lower.match(/\btotal\b/)) {
      priority = 8;
      // Boost priority if it's in the last 30% of lines (where totals usually are)
      if (i > lines.length * 0.7) priority += 3;
    }
    // Medium priority: "balance", "due", "paid"
    else if (lower.match(/\b(balance|due|paid)\b/)) {
      priority = 5;
    }
    
    // Skip lines that look like line items (have item names before the amount)
    if (lower.match(/\b(filet|rib|salad|spinach|potato|item|qty)\b/)) {
      priority = Math.max(0, priority - 5); // Reduce priority significantly
    }
    
    if (priority > 0) {
      // Extract all numbers from this line
      const numbers = line.match(/\$?\s*(\d+[.,]\d{2})\s*\$?|\$\s*(\d+(?:\.\d{2})?)\b/g);
      if (numbers) {
        // Take the last (rightmost) number on the line - usually the total
        const lastNum = numbers[numbers.length - 1];
        const cleanNum = lastNum.replace(/[$\s]/g, '').replace(',', '');
        const val = parseFloat(cleanNum);
        
        if (val > 0 && val < 10000) {
          totalLines.push({ line, amount: val, priority });
          console.log(`[Parser] Found candidate: $${val} (priority ${priority}) in: ${line}`);
        }
      }
    }
  }
  
  // Pick the highest priority total
  if (totalLines.length > 0) {
    totalLines.sort((a, b) => b.priority - a.priority);
    console.log("[Parser] All candidates:", totalLines.map(t => `$${t.amount} (priority ${t.priority})`).join(", "));
    amount = totalLines[0].amount;
    amountLine = totalLines[0].line;
    console.log("[Parser] Selected amount:", amount, "from:", amountLine);
  }
  
  // Priority 2: Any line with currency symbol
  if (!amount) {
    for (const line of lines) {
      const match = line.match(/\$\s*(\d+(?:[.,]\d{2})?)|(\d+(?:[.,]\d{2})?)\s*\$/);
      if (match) {
        const val = parseFloat((match[1] || match[2]).replace(',', ''));
        if (val > 5 && val < 10000) {
          amount = val;
          amountLine = line;
          console.log("[Parser] Found amount with $:", amount);
          break;
        }
      }
    }
  }
  
  // Priority 3: Largest reasonable number (excluding years)
  if (!amount) {
    let maxAmount = 0;
    for (const line of lines) {
      const numbers = line.match(/\b(\d+(?:[.,]\d{2})?)\b/g);
      if (numbers) {
        for (const num of numbers) {
          const val = parseFloat(num.replace(',', ''));
          if (val > 5 && val < 10000 && !(val >= 1990 && val <= 2100 && num.length === 4)) {
            if (val > maxAmount) {
              maxAmount = val;
              amountLine = line;
            }
          }
        }
      }
    }
    if (maxAmount > 0) {
      amount = maxAmount;
      console.log("[Parser] Found amount (largest):", amount);
    }
  }

  // ==================== DATE EXTRACTION ====================
  let date = ""; // Don't default to today - let the API choose based on selected month
  let servicePeriod = "";
  
  const monthMap: Record<string, string> = {
    'jan': '01', 'january': '01', 'feb': '02', 'february': '02',
    'mar': '03', 'march': '03', 'apr': '04', 'april': '04',
    'may': '05', 'jun': '06', 'june': '06',
    'jul': '07', 'july': '07', 'aug': '08', 'august': '08',
    'sep': '09', 'september': '09', 'oct': '10', 'october': '10',
    'nov': '11', 'november': '11', 'dec': '12', 'december': '12'
  };
  
  // Look for dates - prioritize service period "TO" date
  let foundServicePeriod = false;
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Service period: "08/13 TO 09/11" or "FROM 08/13 TO 09/11"
    const periodMatch = line.match(/(?:from\s+)?(\d{1,2})\/(\d{1,2})\s+(?:to|-)\s+(\d{1,2})\/(\d{1,2})/i);
    if (periodMatch && !foundServicePeriod) {
      // Use the "TO" date (end of service period)
      const toMonth = periodMatch[3].padStart(2, '0');
      const toDay = periodMatch[4].padStart(2, '0');
      const year = new Date().getFullYear();
      date = `${year}-${toMonth}-${toDay}`;
      foundServicePeriod = true;
      console.log("[Parser] Found service period TO date:", date);
      continue;
    }
    
    // MM/DD/YYYY or DD/MM/YYYY
    const slashDate = line.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashDate && !foundServicePeriod) {
      const [_, p1, p2, year] = slashDate;
      date = `${year}-${p1.padStart(2, '0')}-${p2.padStart(2, '0')}`;
      console.log("[Parser] Found date:", date);
      break;
    }
    
    // Month DD, YYYY or DD Month YYYY
    const monthDate = line.match(/(\d{1,2})?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i);
    if (monthDate && !foundServicePeriod) {
      const day = monthDate[1] ? monthDate[1].padStart(2, '0') : '01';
      const month = monthMap[monthDate[2].toLowerCase()];
      const year = monthDate[3];
      date = `${year}-${month}-${day}`;
      console.log("[Parser] Found date:", date);
      break;
    }
  }
  
  // Service period
  const periodMatch = text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*[-to]+\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/i);
  if (periodMatch) {
    servicePeriod = periodMatch[0];
    console.log("[Parser] Found service period:", servicePeriod);
  }

  // ==================== MERCHANT & CATEGORY ====================
  let merchant = "Unknown Merchant";
  let category = "Other";
  let description = "";
  
  // Check for bill types
  if (textLower.includes('water')) {
    merchant = "Water Company";
    category = "Bills";
    description = servicePeriod ? `Water bill for ${servicePeriod}` : "Water bill";
  } else if (textLower.match(/electric|electricity|power/)) {
    merchant = "Electric Company";
    category = "Bills";
    description = servicePeriod ? `Electricity bill for ${servicePeriod}` : "Electricity bill";
  } else if (textLower.match(/internet|wifi|broadband/)) {
    merchant = "Internet Provider";
    category = "Bills";
    description = servicePeriod ? `Internet bill for ${servicePeriod}` : "Internet bill";
  } else if (textLower.match(/phone|mobile|cellular/)) {
    merchant = "Phone Company";
    category = "Bills";
    description = servicePeriod ? `Phone bill for ${servicePeriod}` : "Phone bill";
  } else if (textLower.includes('gas') && textLower.match(/bill|utility/)) {
    merchant = "Gas Company";
    category = "Bills";
    description = servicePeriod ? `Gas bill for ${servicePeriod}` : "Gas bill";
  } else if (textLower.match(/starbucks|coffee/)) {
    merchant = lines[0]?.trim() || "Starbucks";
    category = "Food";
    description = "Coffee";
  } else if (textLower.match(/restaurant|cafe|dining/)) {
    merchant = lines[0]?.trim() || "Restaurant";
    category = "Food";
    description = merchant;
  } else if (textLower.match(/grocery|supermarket|market/)) {
    merchant = lines[0]?.trim() || "Grocery Store";
    category = "Food";
    description = "Grocery shopping";
  } else if (textLower.match(/uber|lyft|taxi/)) {
    merchant = "Uber";
    category = "Transit";
    description = "Ride";
  } else if (textLower.match(/gas station|fuel|petrol/)) {
    merchant = lines[0]?.trim() || "Gas Station";
    category = "Transit";
    description = "Fuel";
  } else {
    // Use first non-empty line as merchant
    merchant = lines[0]?.trim().slice(0, 50) || "Unknown Merchant";
    description = merchant;
    
    // Try to categorize
    if (textLower.match(/bill|utility|invoice/)) category = "Bills";
    else if (textLower.match(/food|meal|lunch|dinner/)) category = "Food";
    else if (textLower.match(/transport|travel|ride/)) category = "Transit";
  }

  // ==================== RESULT ====================
  // Lower confidence if amount seems unrealistic
  let confidence = amount > 0 ? 0.9 : 0.2;
  
  // Red flags that suggest OCR error
  if (amount > 1000) confidence = 0.5; // Very high amounts need confirmation
  if (amount > 5000) confidence = 0.3; // Extremely high - likely OCR error
  if (merchant.match(/\d{4}/)) confidence = 0.4; // Merchant has year in it - OCR confused
  
  const autoAdd = amount > 0 && amount < 500 && confidence > 0.8; // Only auto-add reasonable amounts

  // Always use today if no date was found (user is uploading receipt now)
  const finalDate = date || new Date().toISOString().split('T')[0];
  const dateFound = !!date;
  
  return {
    success: true,
    autoAdd,
    data: {
      amount: amount || 0,
      category,
      merchant,
      date: finalDate,
      description: description || merchant,
      confidence,
      extractedText: text.slice(0, 300),
      dateFound, // Flag to indicate if date was actually extracted
    },
    message: amount > 0
      ? `✅ Extracted: $${amount.toFixed(2)} - ${category} - ${merchant}${dateFound ? ` on ${date}` : ' (using today)'}`
      : "⚠️ Could not detect amount. Please check image quality."
  };
}
