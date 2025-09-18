import { prisma } from "../../lib/prisma";
import fetch from "node-fetch";
import { validateChatMessage } from "../../utils/validation";

function analyzeInventory(foodItems) {
  const expiringSoon = [];
  const expired = [];
  const fresh = [];

  foodItems.forEach(item => {
    if (item.daysUntilExpiry < 0) {
      expired.push({
        ...item,
        urgency: 'expired'
      });
    } else if (item.daysUntilExpiry <= 3) {
      expiringSoon.push({
        ...item,
        urgency: 'urgent'
      });
    } else if (item.daysUntilExpiry <= 7) {
      expiringSoon.push({
        ...item,
        urgency: 'soon'
      });
    } else {
      fresh.push({
        ...item,
        urgency: 'fresh'
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
      details: validation.errors 
    });
  }

  try {
    const foodItems = await prisma.foodItem.findMany({ 
      include: { category: true } 
    });

    const inventoryAnalysis = analyzeInventory(foodItems);
    const inventoryContext = {
      totalItems: foodItems.length,
      expiringSoon: inventoryAnalysis.expiringSoon,
      expired: inventoryAnalysis.expired,
      fresh: inventoryAnalysis.fresh,
      allItems: foodItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category.name,
        expiryDate: item.expiryDate,
        daysUntilExpiry: item.daysUntilExpiry,
        status: item.status,
        notes: item.notes
      }))
    };

    const systemPrompt = `You are an intelligent kitchen assistant and inventory manager. Your role is to help users manage their food inventory, suggest recipes, and provide shopping recommendations.

INVENTORY CONTEXT:
- Total items: ${inventoryContext.totalItems}
- Items expiring soon (≤7 days): ${inventoryAnalysis.expiringSoon.length}
- Expired items: ${inventoryAnalysis.expired.length}
- Fresh items: ${inventoryAnalysis.fresh.length}

DETAILED INVENTORY:
${JSON.stringify(inventoryContext.allItems, null, 2)}

YOUR CAPABILITIES:
1. **Expiry Alerts**: Identify items expiring soon and suggest immediate action
2. **Recipe Suggestions**: Recommend recipes using available items, prioritizing expiring ones
3. **Shopping Lists**: Identify missing ingredients for recipes and suggest what to buy
4. **Inventory Management**: Provide tips for better food storage and waste reduction
5. **Meal Planning**: Suggest meal plans based on available ingredients

RESPONSE FORMAT:
Respond ONLY with a valid JSON object (no markdown, no code blocks, no extra text). Use this exact format:
{
  "reply": "Brief conversational response (max 2 sentences)",
  "expiringSoon": [
    {
      "name": "Item name",
      "daysLeft": 2,
      "urgency": "urgent|soon",
      "suggestion": "One specific action"
    }
  ],
  "suggestedRecipes": [
    {
      "name": "Recipe name",
      "ingredients": ["ingredient1", "ingredient2"],
      "usesExpiring": true,
      "missingIngredients": ["missing1"],
      "instructions": "One sentence cooking instruction"
    }
  ],
  "shoppingSuggestions": [
    {
      "item": "Item to buy",
      "reason": "Brief reason",
      "priority": "high|medium|low"
    }
  ],
  "inventoryTips": [
    "One helpful tip"
  ]
}

IMPORTANT RULES:
- Always prioritize expiring items in your suggestions
- Keep responses concise and practical
- Limit to 3 expiring items, 2 recipes, 3 shopping items, 2 tips max
- Be specific about quantities and measurements
- If suggesting recipes, check if all ingredients are available
- For missing ingredients, suggest specific items to buy
- Be encouraging and helpful in your tone
- Respond ONLY with valid JSON, no markdown formatting`;

    const userPrompt = `User message: "${message}"

Please analyze the inventory and provide helpful suggestions based on the user's request. Focus on:
1. Items that are expiring soon and need immediate attention
2. Recipe suggestions that use available ingredients
3. Shopping recommendations for missing items
4. Any inventory management tips`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\n${userPrompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
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
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));

    const generatedContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedContent) {
      throw new Error("No content generated by Gemini API");
    }

    let cleanedContent = generatedContent.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Cleaned content:", cleanedContent);
      aiResponse = {
        reply: generatedContent,
        expiringSoon: inventoryAnalysis.expiringSoon.slice(0, 3).map(item => ({
          name: item.name,
          daysLeft: item.daysUntilExpiry,
          urgency: item.urgency,
          suggestion: `Use within ${item.daysUntilExpiry} days`
        })),
        suggestedRecipes: [],
        shoppingSuggestions: [],
        inventoryTips: ["Check your inventory regularly to avoid waste"]
      };
    }

    const finalResponse = {
      reply: aiResponse.reply || "I'm here to help with your inventory management!",
      expiringSoon: aiResponse.expiringSoon || [],
      suggestedRecipes: aiResponse.suggestedRecipes || [],
      shoppingSuggestions: aiResponse.shoppingSuggestions || [],
      inventoryTips: aiResponse.inventoryTips || [],
      inventorySummary: {
        totalItems: inventoryContext.totalItems,
        expiringCount: inventoryAnalysis.expiringSoon.length,
        expiredCount: inventoryAnalysis.expired.length
      }
    };

    res.status(200).json(finalResponse);

  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ 
      error: "Failed to process your request", 
      details: error.message 
    });
  }
}
