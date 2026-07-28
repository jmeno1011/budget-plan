import { NextResponse } from "next/server"
import { CATEGORIES, type CategoryValue } from "@/lib/types"

type CategoryConfidence = "low" | "medium" | "high"

type CategorizeResponse = {
  category: CategoryValue
  confidence: CategoryConfidence
  reason: string
}

const CATEGORY_VALUES = CATEGORIES.map((category) => category.value)
const CONFIDENCE_VALUES = ["low", "medium", "high"]

const systemPrompt = `
You categorize personal budget expense notes.
Return one category only from the allowed enum.
Use utilities for rent, internet, electricity, gas, water, council tax, subscriptions, and bills.
Use food for groceries, cafes, restaurants, supermarkets, takeaways, and food shops.
Use transport for train, bus, tube, taxi, rideshare, fuel, parking, and flights.
Use shopping for clothes, electronics, gifts, home goods, and generic retail purchases.
Use entertainment for cinema, concerts, games, leisure, trips, and activities.
Use health for pharmacy, medicine, medical, dental, and fitness costs.
Use other when the memo is unclear.
`

function extractOutputText(data: unknown) {
  if (!data || typeof data !== "object") return undefined
  const response = data as {
    output_text?: unknown
    output?: Array<{
      content?: Array<{
        type?: string
        text?: unknown
      }>
    }>
  }

  if (typeof response.output_text === "string") {
    return response.output_text
  }

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => typeof content.text === "string")?.text as
    | string
    | undefined
}

function isCategorizeResponse(value: unknown): value is CategorizeResponse {
  if (!value || typeof value !== "object") return false
  const response = value as Partial<CategorizeResponse>

  return (
    typeof response.category === "string" &&
    CATEGORY_VALUES.includes(response.category as CategoryValue) &&
    typeof response.confidence === "string" &&
    CONFIDENCE_VALUES.includes(response.confidence) &&
    typeof response.reason === "string"
  )
}

function parseCategorizeResponse(outputText?: string) {
  if (!outputText) return undefined

  try {
    return JSON.parse(outputText)
  } catch {
    return undefined
  }
}

export async function POST(request: Request) {
  const { memo, amount } = await request.json()
  const trimmedMemo = typeof memo === "string" ? memo.trim() : ""

  if (!trimmedMemo) {
    return NextResponse.json({ error: "Memo is required" }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 },
    )
  }

  const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CATEGORY_MODEL ?? "gpt-5.6-luna",
      input: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            memo: trimmedMemo,
            amount: typeof amount === "number" ? amount : undefined,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "expense_category",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["category", "confidence", "reason"],
            properties: {
              category: {
                type: "string",
                enum: CATEGORY_VALUES,
              },
              confidence: {
                type: "string",
                enum: CONFIDENCE_VALUES,
              },
              reason: {
                type: "string",
              },
            },
          },
        },
      },
      store: false,
    }),
  })

  if (!openAIResponse.ok) {
    return NextResponse.json(
      { error: "Could not categorize expense" },
      { status: 502 },
    )
  }

  const data = await openAIResponse.json()
  const outputText = extractOutputText(data)
  const parsed = parseCategorizeResponse(outputText)

  if (!isCategorizeResponse(parsed)) {
    return NextResponse.json(
      { error: "Invalid categorization response" },
      { status: 502 },
    )
  }

  return NextResponse.json(parsed)
}
