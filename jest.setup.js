import '@testing-library/jest-dom'

// ค่าจำลองสำหรับ Supabase env vars — jest.mock() แบบ automock ยังต้อง require ไฟล์จริงก่อนสร้าง mock
// (เพื่อดูรูปร่างของ exports) ทำให้โค้ดระดับบนสุดของ src/lib/supabase/{server,service}.ts ที่เช็ค
// env var แล้ว throw ถ้าไม่มีค่า ทำงานก่อนถูก mock ทับ ต้องตั้งค่าจำลองไว้ตั้งแต่ก่อนไฟล์เทสต์ import
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url) => {
    throw new Error(`REDIRECT_TO: ${url}`)
  }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn((key) => {
      const headerMap = {
        host: 'localhost:3000',
        'x-forwarded-proto': 'https',
      }
      return headerMap[key] || null
    }),
  })),
}))

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}
