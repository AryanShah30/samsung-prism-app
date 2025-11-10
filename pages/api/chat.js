import { prisma } from "../../lib/prisma";
import fetch from "node-fetch";
import { validateChatMessage } from "../../utils/validation";
import { EXPIRY_THRESHOLDS } from "../../utils/config";

function analyzeInventory(foodItems) {
  const expiringSoon = [];
  const expired = [];
  const fresh = [];

  foodItems.forEach((item) => {
    if (item.daysUntilExpiry < 0) {
      expired.push({
        ...item,
        urgency: "expired",
      });
    } else if (item.daysUntilExpiry <= EXPIRY_THRESHOLDS.URGENT_DAYS) {
      expiringSoon.push({
        ...item,
        urgency: "urgent",
      });
    } else if (item.daysUntilExpiry <= EXPIRY_THRESHOLDS.SOON_DAYS) {
      expiringSoon.push({
        ...item,
        urgency: "soon",
      });
    } else {
      fresh.push({
        ...item,
        urgency: "fresh",
      });
    }
  });

  return { expiringSoon, expired, fresh };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  const validation = validateChatMessage({ message });
  if (!validation.isValid) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors,
    });
  }

  try {
    const foodItems = await prisma.foodItem.findMany({
      include: { category: true },
    });

    const inventoryAnalysis = analyzeInventory(foodItems);
    const inventoryContext = {
      totalItems: foodItems.length,
      expiringSoon: inventoryAnalysis.expiringSoon,
      expired: inventoryAnalysis.expired,
      fresh: inventoryAnalysis.fresh,
      allItems: foodItems.map((item) => ({
        name: item.name,
        volume: item.volume,
        volumeUnit: item.volumeUnit || 'g',
        category: item.category.name,
        expiryDate: item.expiryDate,
        daysUntilExpiry: item.daysUntilExpiry,
        status: item.status,
        notes: item.notes,
      })),

      categories: [...new Set(foodItems.map((item) => item.category.name))],
      urgentItems: inventoryAnalysis.expiringSoon.filter(
        (item) => item.urgency === "urgent"
      ),
      soonItems: inventoryAnalysis.expiringSoon.filter(
        (item) => item.urgency === "soon"
      ),
      proteinItems: foodItems.filter((item) =>
        ["meat", "poultry", "seafood", "dairy", "eggs", "beans", "nuts"].some(
          (cat) => item.category.name.toLowerCase().includes(cat)
        )
      ),
      vegetableItems: foodItems.filter(
        (item) =>
          item.category.name.toLowerCase().includes("vegetable") ||
          item.category.name.toLowerCase().includes("produce")
      ),
      pantryItems: foodItems.filter((item) =>
        ["grains", "cereals", "pasta", "rice", "bread", "canned"].some((cat) =>
          item.category.name.toLowerCase().includes(cat)
        )
      ),
    };

    const systemPrompt = `You are "Chef AI", a helpful kitchen assistant. Be proactive but ask permission before providing detailed suggestions.

INVENTORY CONTEXT:
- Total items: ${inventoryContext.totalItems}
- Urgent items (≤3 days): ${inventoryContext.urgentItems.length}
- Soon items (4-7 days): ${inventoryContext.soonItems.length}

URGENT ITEMS:
${inventoryContext.urgentItems
  .map(
    (item) =>
      `- ${item.name} (${item.daysUntilExpiry} days left)`
  )
  .join("\n")}

EXPIRING SOON:
${inventoryContext.soonItems
  .map(
    (item) =>
      `- ${item.name} (${item.daysUntilExpiry} days left)`
  )
  .join("\n")}

CONVERSATION CONTEXT:
- If urgent items exist: Mention them briefly and offer help
- If no urgent items but expiring soon: Offer recipe suggestions
- If user asks about recipes: Provide 1-2 ideas and ask for more
- If user asks general questions: Answer directly and offer inventory help

RESPONSE STRATEGY:
- For greetings: Be friendly and mention if there are urgent items, then ask what they'd like help with
- For simple questions: Answer directly but offer to help with inventory if relevant
- For inventory questions: Provide helpful details and ask follow-up questions
- For recipe requests: Give 1-2 suggestions and ask if they want more options
- Always ask permission before providing extensive lists or detailed analysis
- Be conversational and engaging, not robotic

EXAMPLES:
- "Hey! I notice you have some items expiring soon. Would you like me to suggest some recipes to use them up?"
- "I can help with that! Would you like me to check your inventory for relevant items?"
- "Here are a couple of ideas: [suggestion]. Would you like more options or help with something specific?"`;

    const isGreeting = /^(hi|hello|hey|hiya|sup|what's up|howdy|good morning|good afternoon|good evening)$/i.test(message.trim());
    const isSimpleQuestion = message.trim().length < 20 && !message.includes('recipe') && !message.includes('cook') && !message.includes('food');
    
    const userPrompt = `User message: "${message}"

${isGreeting ? 'This appears to be a greeting. Be friendly and mention urgent items if any, then ask what they need help with.' : ''}
${isSimpleQuestion ? 'This is a simple question. Answer directly and offer to help with inventory if relevant.' : ''}

Respond naturally and be helpful. If there are urgent items, mention them briefly and ask if they want help. For recipe or food questions, provide 1-2 suggestions and ask if they want more. Always ask permission before giving extensive details.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\n${userPrompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 400,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      // try to surface Gemini error details
      let text = null;
      try {
        text = await response.text();
      } catch (e) {
        text = null;
      }

      console.error('Gemini API returned non-OK:', response.status, response.statusText, text);

      if (response.status === 429) {
        return res.status(503).json({
          error: "Gemini quota exceeded",
          details: text || `${response.status} ${response.statusText}`,
        });
      }

      return res.status(502).json({
        error: "Gemini API error",
        status: response.status,
        statusText: response.statusText,
        details: text,
      });
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));

    const generatedContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedContent) {
      throw new Error("No content generated by Gemini API");
    }

    let cleanedContent = generatedContent.trim();
    if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent
        .replace(/^```\w*\s*/, "")
        .replace(/\s*```$/, "");
    }

    const finalResponse = {
      reply:
        cleanedContent ||
        "Hey there! I'm Chef AI, your friendly kitchen assistant. What would you like to chat about today?",
      showSuggestions: false,
      expiringSoon: [],
      suggestedRecipes: [],
      shoppingSuggestions: [],
      inventoryTips: [],
      inventorySummary: {
        totalItems: inventoryContext.totalItems,
        expiringCount: inventoryAnalysis.expiringSoon.length,
        expiredCount: inventoryAnalysis.expired.length,
      },
    };

    res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({
      error: "Failed to process your request",
      details: error.message,
    });
  }
}
