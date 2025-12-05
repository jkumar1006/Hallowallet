// Simple command parser for natural language expense/goal/watch commands

export function parseCommand(text: string) {
  const textLower = text.toLowerCase().trim();
  
  // Extract amount - handle both numbers and words
  let amount: number | undefined;
  
  // Try numeric amount first
  const numericMatch = text.match(/\$?(\d+(?:\.\d+)?)/);
  if (numericMatch) {
    amount = parseFloat(numericMatch[1]);
  } else {
    // Try word amounts: "thousand", "hundred", etc.
    if (textLower.includes("thousand")) {
      const thousandMatch = textLower.match(/(\w+)\s+thousand/);
      if (thousandMatch) {
        const multiplier = thousandMatch[1];
        if (multiplier === "one" || multiplier === "a") amount = 1000;
        else if (multiplier === "two") amount = 2000;
        else if (multiplier === "three") amount = 3000;
        else if (multiplier === "five") amount = 5000;
        else if (multiplier === "ten") amount = 10000;
        else amount = 1000; // default
      } else {
        amount = 1000;
      }
    } else if (textLower.includes("hundred")) {
      const hundredMatch = textLower.match(/(\w+)\s+hundred/);
      if (hundredMatch) {
        const multiplier = hundredMatch[1];
        if (multiplier === "one" || multiplier === "a") amount = 100;
        else if (multiplier === "two") amount = 200;
        else if (multiplier === "five") amount = 500;
        else amount = 100;
      } else {
        amount = 100;
      }
    }
  }
  
  // Extract period (default to monthly if not found)
  const periodMatch = textLower.match(/(weekly|monthly|yearly|week|month|year)/i);
  let period: "weekly" | "monthly" | "yearly" = "monthly";
  if (periodMatch) {
    const p = periodMatch[1];
    if (p.includes("week")) period = "weekly";
    else if (p.includes("year")) period = "yearly";
    else period = "monthly";
  }
  
  // Extract category (word after "for" or last meaningful word)
  let category: string | undefined;
  const forMatch = text.match(/for\s+(\w+)/i);
  if (forMatch) {
    category = forMatch[1];
  } else {
    // Try to find category near the end
    const words = text.split(/\s+/).filter(w => w.length > 2);
    const lastWord = words[words.length - 1]?.toLowerCase();
    if (lastWord && !["goal", "goals", "watch", "monthly", "weekly", "yearly", "dollars", "dollar"].includes(lastWord)) {
      category = lastWord;
    }
  }
  
  return { amount, period, category };
}
