import { generateText, Output } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

const recipeSchema = z.object({
  weeks: z.array(z.object({
    weekNumber: z.number(),
    breakfast: z.array(z.object({
      name: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      prepTime: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.string().nullable(),
    })),
    snack: z.array(z.object({
      name: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      prepTime: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.string().nullable(),
    })),
    lunch: z.array(z.object({
      name: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      prepTime: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.string().nullable(),
    })),
    dinner: z.array(z.object({
      name: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      prepTime: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.string().nullable(),
    })),
  }))
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { clientName, goals, restrictions, dailyCalories, dailyProtein, weeksToGenerate = 4 } = req.body
    
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
    }

    const anthropic = createAnthropic({ apiKey })

    const prompt = `Generate a ${weeksToGenerate}-week personalized meal plan for ${clientName || 'a client'}.

## Client Profile
- Goals: ${goals || 'General health and fitness'}
- Dietary Restrictions: ${restrictions || 'None specified'}
- Daily Calorie Target: ${dailyCalories || 2000} calories
- Daily Protein Target: ${dailyProtein || 150}g protein

## Requirements
- Generate 3 recipe options for each meal category per week
- Recipes should be practical and easy to prepare
- Include variety across weeks (different cuisines, cooking methods)
- Ensure each day's meals roughly add up to the calorie/protein targets
- Prep times should be realistic (5-30 minutes for most meals)
- Include specific macros (calories, protein, carbs, fat) for each recipe

## Meal Categories
For each week, provide 3 options each for:
- Breakfast (higher protein, energizing)
- Snack (quick, protein-focused)
- Lunch (balanced, meal-prep friendly)
- Dinner (satisfying, varied proteins)

Make recipes practical, delicious, and aligned with the client's goals.`

    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      output: Output.object({
        schema: recipeSchema,
      }),
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    })

    res.status(200).json({ mealPlan: output })
  } catch (error) {
    console.error('[v0] Recipe generation error:', error)
    res.status(500).json({ 
      error: 'Failed to generate recipes', 
      details: error.message 
    })
  }
}
