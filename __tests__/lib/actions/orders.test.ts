import { createOrderAction, cancelOrderAction, reorderAction } from '@/lib/actions/orders'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getCart } from '@/lib/data/cart'
import { createCardCharge } from '@/lib/payments/opn'
import { fireAndForgetLog } from '@/lib/actions/logging'

// Mock all external dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/service')
jest.mock('@/lib/data/cart')
jest.mock('@/lib/payments/opn')
jest.mock('@/lib/actions/logging')
jest.mock('@/lib/actions/cart')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateServiceClient = createServiceClient as jest.MockedFunction<typeof createServiceClient>
const mockGetCart = getCart as jest.MockedFunction<typeof getCart>
const mockCreateCardCharge = createCardCharge as jest.MockedFunction<typeof createCardCharge>
const mockFireAndForgetLog = fireAndForgetLog as jest.MockedFunction<typeof fireAndForgetLog>

type MockSupabaseClient = {
  auth: { getUser: jest.Mock }
  from: jest.Mock
  rpc?: jest.Mock
}

type MockServiceClient = {
  from: jest.Mock
}

describe('Orders Actions - createOrderAction', () => {
  let mockSupabase: MockSupabaseClient
  let mockServiceSupabase: MockServiceClient

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock implementation
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
      rpc: jest.fn(),
    }

    mockServiceSupabase = {
      from: jest.fn(),
    }

    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)
    mockCreateServiceClient.mockReturnValue(mockServiceSupabase as unknown as ReturnType<typeof createServiceClient>)
  })

  it('should redirect to login if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    const formData = new FormData()
    formData.append('addressId', '1')
    formData.append('paymentMethod', 'promptpay')

    await expect(createOrderAction(null, formData)).rejects.toThrow('REDIRECT_TO: /login')
  })

  it('should return error if addressId is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    const formData = new FormData()
    formData.append('paymentMethod', 'promptpay')

    const result = await createOrderAction(null, formData)
    expect(result).toEqual({ error: 'กรุณาเลือกที่อยู่จัดส่ง' })
  })

  it('should return error if payment method is invalid', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    const formData = new FormData()
    formData.append('addressId', '1')
    formData.append('paymentMethod', 'invalid_method')

    const result = await createOrderAction(null, formData)
    expect(result).toEqual({ error: 'กรุณาเลือกวิธีการชำระเงิน' })
  })

  it('should return error if address does not belong to user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    })

    const formData = new FormData()
    formData.append('addressId', '999')
    formData.append('paymentMethod', 'promptpay')

    const result = await createOrderAction(null, formData)
    expect(result).toEqual({ error: 'ไม่พบที่อยู่จัดส่งที่เลือก' })
  })

  it('should return error if cart is empty', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: 1 } }),
          }),
        }),
      }),
    })

    mockGetCart.mockResolvedValue({
      items: [],
      cartId: null,
      itemCount: 0,
    })

    const formData = new FormData()
    formData.append('addressId', '1')
    formData.append('paymentMethod', 'promptpay')

    const result = await createOrderAction(null, formData)
    expect(result).toEqual({ error: 'ตะกร้าสินค้าว่างเปล่า' })
  })

  it('should return error if item is out of stock', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: 1 } }),
          }),
        }),
      }),
    })

    mockGetCart.mockResolvedValue({
      items: [
        {
          cartItemId: 1,
          quantity: 5,
          product: { id: 1, name: 'Test Product', slug: 'test-product', price: 100, stockQuantity: 2, imageUrl: null },
        },
      ],
      cartId: 1,
      itemCount: 5,
    })

    const formData = new FormData()
    formData.append('addressId', '1')
    formData.append('paymentMethod', 'promptpay')

    const result = await createOrderAction(null, formData)
    expect(result?.error).toContain('มีไม่พอ')
  })

  it('should successfully create order with COD payment', async () => {
    const userId = 'user-123'
    const orderId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: 1 } }),
          }),
        }),
      }),
    })

    mockGetCart.mockResolvedValue({
      items: [
        {
          cartItemId: 1,
          quantity: 2,
          product: { id: 1, name: 'Test Product', slug: 'test-product', price: 100, stockQuantity: 10, imageUrl: null },
        },
      ],
      cartId: 1,
      itemCount: 2,
    })

    // Mock order creation
    const selectMock = jest.fn()
    selectMock.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: { id: orderId },
        error: null,
      }),
    })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          insert: jest.fn().mockReturnValue({
            select: selectMock,
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      } else if (table === 'order_items') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      } else if (table === 'cart_items') {
        return {
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      // addresses: เช็คว่าที่อยู่เป็นของผู้ใช้จริงก่อนสร้างออเดอร์
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { id: 1 } }),
            }),
          }),
        }),
      }
    })

    mockSupabase.rpc!.mockResolvedValue({ error: null })

    mockServiceSupabase.from.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        }
      }
      return {}
    })

    const formData = new FormData()
    formData.append('addressId', '1')
    formData.append('paymentMethod', 'cod')

    // COD สำเร็จ -> redirect ไปหน้าสำเร็จ (mock redirect() throw เหมือนพฤติกรรมจริงของ Next.js)
    await expect(createOrderAction(null, formData)).rejects.toThrow(
      'REDIRECT_TO: /account/orders?success=1',
    )

    // Should log the order creation
    expect(mockFireAndForgetLog).toHaveBeenCalledWith(
      userId,
      'order.created',
      'orders',
      orderId,
      expect.objectContaining({
        paymentMethod: 'cod',
        totalAmount: 200,
      })
    )
  })

  it('should handle card charge failure and rollback order', async () => {
    const userId = 'user-123'
    const orderId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockGetCart.mockResolvedValue({
      items: [
        {
          cartItemId: 1,
          quantity: 1,
          product: { id: 1, name: 'Test Product', slug: 'test-product', price: 100, stockQuantity: 10, imageUrl: null },
        },
      ],
      cartId: 1,
      itemCount: 1,
    })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: orderId },
              }),
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'order_items') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      // addresses
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { id: 1 } }),
            }),
          }),
        }),
      }
    })

    mockSupabase.rpc!.mockResolvedValue({ error: null })

    mockServiceSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    })

    mockCreateCardCharge.mockRejectedValue(new Error('Payment gateway error'))

    const formData = new FormData()
    formData.append('addressId', '1')
    formData.append('paymentMethod', 'credit_card')
    formData.append('cardToken', 'test-token')

    const result = await createOrderAction(null, formData)
    expect(result?.error).toContain('เชื่อมต่อระบบชำระเงิน')
  })
})

describe('Orders Actions - cancelOrderAction', () => {
  let mockSupabase: MockSupabaseClient

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    }
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)
  })

  it('should cancel pending order and log the action', async () => {
    const userId = 'user-123'
    const orderId = 1
    const reason = 'Changed mind'

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    const updateMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    })

    mockSupabase.from.mockReturnValue({
      update: updateMock,
    })

    await cancelOrderAction(orderId, reason)

    expect(mockFireAndForgetLog).toHaveBeenCalledWith(userId, 'order.cancelled', 'orders', orderId, {
      reason,
    })
  })
})

describe('Orders Actions - reorderAction', () => {
  let mockSupabase: MockSupabaseClient

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    }
    mockCreateClient.mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)
  })

  it('should add items from previous order to cart', async () => {
    const userId = 'user-123'
    const orderId = 1

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    const fromMock = jest.fn()
    fromMock.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: { id: orderId } }),
              }),
            }),
          }),
        }
      } else if (table === 'order_items') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [
                {
                  quantity: 2,
                  products: { id: 1, stock_quantity: 10, is_active: true },
                },
              ],
            }),
          }),
        }
      }
      return {}
    })

    mockSupabase.from.mockImplementation(fromMock)

    await expect(reorderAction(orderId)).rejects.toThrow()
  })

  it('should return error if order not found', async () => {
    const userId = 'user-123'

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    })

    const result = await reorderAction(999)
    expect(result).toEqual({ error: 'ไม่พบคำสั่งซื้อนี้' })
  })
})
