import {
  getOrCreatePromptPayQrAction,
  checkPromptPayStatusAction,
} from '@/lib/actions/payments'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createPromptPayCharge, getCharge } from '@/lib/payments/opn'
import { fireAndForgetLog } from '@/lib/actions/logging'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/service')
jest.mock('@/lib/payments/opn')
jest.mock('@/lib/actions/logging')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateServiceClient = createServiceClient as jest.MockedFunction<typeof createServiceClient>
const mockCreatePromptPayCharge = createPromptPayCharge as jest.MockedFunction<typeof createPromptPayCharge>
const mockGetCharge = getCharge as jest.MockedFunction<typeof getCharge>
const mockFireAndForgetLog = fireAndForgetLog as jest.MockedFunction<typeof fireAndForgetLog>

type MockSupabaseClient = {
  auth: { getUser: jest.Mock }
  from: jest.Mock
}

type MockServiceClient = {
  from: jest.Mock
}

describe('Payments Actions - getOrCreatePromptPayQrAction', () => {
  let mockSupabase: MockSupabaseClient
  let mockServiceSupabase: MockServiceClient

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    }

    mockServiceSupabase = {
      from: jest.fn(),
    }

    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)
    mockCreateServiceClient.mockReturnValue(mockServiceSupabase as unknown as ReturnType<typeof createServiceClient>)
  })

  it('should return error if order not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    const result = await getOrCreatePromptPayQrAction(1)
    expect(result).toEqual({ ok: false, error: 'ไม่พบคำสั่งซื้อนี้' })
  })

  it('should return error if payment record not found', async () => {
    const userId = 'user-123'
    const orderId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: orderId } }),
          }),
        }),
      }),
    })

    mockServiceSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getOrCreatePromptPayQrAction(orderId)
    expect(result).toEqual({ ok: false, error: 'ไม่พบรายการชำระเงินของคำสั่งซื้อนี้' })
  })

  it('should return success status if already paid', async () => {
    const userId = 'user-123'
    const orderId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: orderId } }),
          }),
        }),
      }),
    })

    mockServiceSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 1, transaction_ref: 'ref-123', payment_status: 'success' },
          }),
        }),
      }),
    })

    const result = await getOrCreatePromptPayQrAction(orderId)
    expect(result).toEqual({
      ok: true,
      qrImageDataUri: null,
      status: 'successful',
      expiresAt: null,
    })
  })

  it('should create new charge if no previous transaction', async () => {
    const userId = 'user-123'
    const orderId = 1
    const amount = 500

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: orderId, total_amount: amount, user_id: userId },
            }),
          }),
        }),
      }),
    })

    mockServiceSupabase.from.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { id: 1, transaction_ref: null, payment_status: 'pending' },
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      return {}
    })

    mockCreatePromptPayCharge.mockResolvedValue({
      chargeId: 'charge-123',
      qrImageDataUri: 'data:image/png;base64,...',
      status: 'pending',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    })

    const result = await getOrCreatePromptPayQrAction(orderId)

    expect(result.ok).toBe(true)
    expect(result).toHaveProperty('qrImageDataUri')
    expect(mockCreatePromptPayCharge).toHaveBeenCalledWith(amount, `DeskLab Order #${orderId}`)
  })

  it('should reuse existing valid charge', async () => {
    const userId = 'user-123'
    const orderId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: orderId } }),
          }),
        }),
      }),
    })

    const futureExpiry = new Date(Date.now() + 3600000).toISOString()

    mockServiceSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: 1,
              transaction_ref: 'existing-charge-id',
              payment_status: 'pending',
            },
          }),
        }),
      }),
    })

    mockGetCharge.mockResolvedValue({
      chargeId: 'existing-charge-id',
      qrImageDataUri: 'data:image/png;base64,...',
      status: 'pending',
      expiresAt: futureExpiry,
    })

    const result = await getOrCreatePromptPayQrAction(orderId)

    expect(result.ok).toBe(true)
    expect(mockGetCharge).toHaveBeenCalledWith('existing-charge-id')
    expect(mockCreatePromptPayCharge).not.toHaveBeenCalled()
  })

  it('should create new charge if existing one is expired', async () => {
    const userId = 'user-123'
    const orderId = 1
    const paymentId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: orderId } }),
          }),
        }),
      }),
    })

    const pastExpiry = new Date(Date.now() - 3600000).toISOString()

    mockServiceSupabase.from.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: {
                  id: paymentId,
                  transaction_ref: 'expired-charge-id',
                  payment_status: 'pending',
                },
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      return {}
    })

    mockGetCharge.mockResolvedValue({
      chargeId: 'expired-charge-id',
      qrImageDataUri: null,
      status: 'pending',
      expiresAt: pastExpiry,
    })

    mockCreatePromptPayCharge.mockResolvedValue({
      chargeId: 'new-charge-id',
      qrImageDataUri: 'data:image/png;base64,...',
      status: 'pending',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    })

    const result = await getOrCreatePromptPayQrAction(orderId)

    expect(result.ok).toBe(true)
    expect(mockCreatePromptPayCharge).toHaveBeenCalled()
  })
})

describe('Payments Actions - checkPromptPayStatusAction', () => {
  let mockSupabase: MockSupabaseClient
  let mockServiceSupabase: MockServiceClient

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    }

    mockServiceSupabase = {
      from: jest.fn(),
    }

    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)
    mockCreateServiceClient.mockReturnValue(mockServiceSupabase as unknown as ReturnType<typeof createServiceClient>)
  })

  it('should return error if order not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    const result = await checkPromptPayStatusAction(1)
    expect(result).toEqual({ ok: false, error: 'ไม่พบคำสั่งซื้อนี้' })
  })

  it('should return successful status if already paid', async () => {
    const userId = 'user-123'
    const orderId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: orderId } }),
          }),
        }),
      }),
    })

    mockServiceSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 1, transaction_ref: 'ref-123', payment_status: 'success' },
          }),
        }),
      }),
    })

    const result = await checkPromptPayStatusAction(orderId)
    expect(result).toEqual({ ok: true, status: 'successful' })
  })

  it('should update payment status when charge is successful', async () => {
    const userId = 'user-123'
    const orderId = 1
    const paymentId = 1
    const amount = 500

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: orderId, total_amount: amount, user_id: userId },
            }),
          }),
        }),
      }),
    })

    mockServiceSupabase.from.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { id: paymentId, transaction_ref: 'charge-123', payment_status: 'pending' },
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      } else if (table === 'orders') {
        return {
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      return {}
    })

    mockGetCharge.mockResolvedValue({
      chargeId: 'charge-123',
      qrImageDataUri: null,
      status: 'successful',
      expiresAt: null,
    })

    const result = await checkPromptPayStatusAction(orderId)

    expect(result).toEqual({ ok: true, status: 'successful' })
    expect(mockFireAndForgetLog).toHaveBeenCalledWith(
      userId,
      'payment.charged',
      'payments',
      paymentId,
      expect.objectContaining({
        orderId,
        amount,
      })
    )
  })

  it('should handle expired charges', async () => {
    const userId = 'user-123'
    const orderId = 1
    const paymentId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: orderId, total_amount: 500, user_id: userId },
            }),
          }),
        }),
      }),
    })

    const pastExpiry = new Date(Date.now() - 1000).toISOString()

    mockServiceSupabase.from.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { id: paymentId, transaction_ref: 'charge-123', payment_status: 'pending' },
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      return {}
    })

    mockGetCharge.mockResolvedValue({
      chargeId: 'charge-123',
      status: 'pending',
      qrImageDataUri: null,
      expiresAt: pastExpiry,
    })

    const result = await checkPromptPayStatusAction(orderId)

    expect(result).toEqual({ ok: true, status: 'expired' })
  })

  it('should handle Opn API errors gracefully', async () => {
    const userId = 'user-123'
    const orderId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: orderId, total_amount: 500, user_id: userId },
            }),
          }),
        }),
      }),
    })

    mockServiceSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 1, transaction_ref: 'charge-123', payment_status: 'pending' },
          }),
        }),
      }),
    })

    mockGetCharge.mockRejectedValue(new Error('Opn API error'))

    const result = await checkPromptPayStatusAction(orderId)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Opn API error')
    }
  })
})
