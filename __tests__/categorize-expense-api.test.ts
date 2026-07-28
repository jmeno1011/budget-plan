/// <reference types="jest" />

import { afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'

describe('categorize expense API', () => {
  const originalKey = process.env.OPENAI_API_KEY

  beforeAll(() => {
    const { TextDecoder, TextEncoder } = require('util')
    const { ReadableStream, TransformStream } = require('stream/web')
    global.TextDecoder = TextDecoder
    global.TextEncoder = TextEncoder
    global.ReadableStream = ReadableStream
    global.TransformStream = TransformStream
    const { Headers, Request, Response } = require('undici')
    global.Headers = Headers
    global.Request = Request
    global.Response = Response
  })

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key'
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            output_text: JSON.stringify({
              category: 'food',
              confidence: 'high',
              reason: 'Memo mentions food shop.',
            }),
          }),
      } as Response),
    )
  })

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalKey
    ;(global.fetch as jest.Mock | undefined)?.mockRestore()
  })

  it('returns a category from a structured OpenAI response', async () => {
    const { POST } = await import('@/app/api/categorize-expense/route')

    const response = await POST(
      new Request('http://localhost/api/categorize-expense', {
        method: 'POST',
        body: JSON.stringify({ memo: 'Food shop', amount: 85 }),
      }),
    )

    await expect(response.json()).resolves.toEqual({
      category: 'food',
      confidence: 'high',
      reason: 'Memo mentions food shop.',
    })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/responses',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      }),
    )
  })
})
