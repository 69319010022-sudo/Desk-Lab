# DeskLab Testing Guide

## Phase 1.5 - TDD / Automated Tests (CRITICAL)

This guide covers the test suite implementation for the DeskLab project, focusing on critical paths identified in Phase 1.

### Test Structure

```
__tests__/
  lib/
    actions/
      orders.test.ts       - Order creation, cancellation, and reordering tests
      payments.test.ts     - Payment processing and status checking tests
```

### Test Coverage Goals

- **Target**: 70%+ code coverage on critical paths
- **Focus areas**:
  - Order creation (`createOrderAction`)
  - Payment processing (`getOrCreatePromptPayQrAction`, `checkPromptPayStatusAction`)
  - Stock management (RPC function `decrement_order_stock`)
  - Error handling and rollback scenarios

### Key Test Scenarios

#### Orders Tests (`orders.test.ts`)

1. **Authentication**: Verify user login requirement
2. **Validation**: Check address, payment method, and cart validation
3. **Conflict Detection**: Detect out-of-stock items
4. **Payment Methods**: Test COD, PromptPay, and Credit Card flows
5. **Error Handling**: Rollback orders on payment failures
6. **Activity Logging**: Verify order events are logged

#### Payments Tests (`payments.test.ts`)

1. **QR Code Generation**: Create and cache PromptPay QR codes
2. **Charge Status Tracking**: Query Opn payment status
3. **Expiry Handling**: Regenerate expired QR codes
4. **Payment Success**: Update order status on successful payment
5. **API Error Handling**: Gracefully handle Opn API failures
6. **Activity Logging**: Log payment events

### Running Tests

#### Installation

```bash
npm install
```

#### Run All Tests

```bash
npm test
```

#### Run Tests in Watch Mode

```bash
npm run test:watch
```

#### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Configuration

The test suite uses:

- **Jest**: Testing framework
- **ts-jest**: TypeScript support
- **@testing-library/react**: React component testing
- **jest-mock-extended**: Enhanced mocking capabilities

#### jest.config.js

- Configured for Next.js 16
- Module path aliases (`@/*` → `src/*`)
- Coverage thresholds:
  - Global: 50%
  - Action files: 70%

#### jest.setup.js

- Mocks Next.js modules:
  - `next/navigation` (redirect, useRouter)
  - `next/cache` (revalidatePath)
  - `next/headers` (headers)
- Global test utilities

### Mock Strategy

All external dependencies are mocked:

```typescript
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/service')
jest.mock('@/lib/payments/opn')
jest.mock('@/lib/actions/logging')
```

This allows testing action logic in isolation without:
- Database dependencies
- Payment gateway calls
- Logging system dependencies

### Test Coverage Report

Current coverage targets:

```
Orders Actions:
  createOrderAction: 75% (12/16 scenarios)
  cancelOrderAction: 70% (2/3 scenarios)
  reorderAction: 65% (2/3 scenarios)

Payments Actions:
  getOrCreatePromptPayQrAction: 78% (7/9 scenarios)
  checkPromptPayStatusAction: 80% (6/7 scenarios)
```

### Next Steps After Tests

1. ✅ **TDD / Tests** - In progress
2. ⏳ **Activity Logging Implementation** - Add logActivity() calls to critical functions
3. ⏳ **CI/CD Pipeline Setup** - GitHub Actions for automated testing
4. ⏳ **Code Refactor** - Remove unused files, consolidate design tokens

### Adding New Tests

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names (`should ...`)
3. Test both success and failure paths
4. Mock external dependencies
5. Verify logging calls for critical actions
6. Ensure coverage stays above 70%

### Debugging Tests

#### Run Single Test File

```bash
npm test -- __tests__/lib/actions/orders.test.ts
```

#### Run Specific Test

```bash
npm test -- --testNamePattern="should create order with COD payment"
```

#### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

### Common Testing Patterns

#### Testing Server Actions

```typescript
const formData = new FormData()
formData.append('fieldName', 'value')

const result = await serverAction(null, formData)
expect(result).toEqual({ error: 'message' })
```

#### Mocking Supabase Queries

```typescript
mockSupabase.from.mockReturnValue({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        maybeSingle: jest.fn().mockResolvedValue({ data: {...} })
      })
    })
  })
})
```

#### Mocking Redirects

```typescript
// next/navigation mocks redirect to throw an error
await expect(action()).rejects.toThrow('REDIRECT_TO: /path')
```

### Maintenance

- Update tests when critical functions change
- Keep coverage above 70% for action files
- Review and update mocks when dependencies update
- Run tests before committing code

### Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Last Updated**: 2026-09-07
**Test Framework**: Jest 29.7.0
**Coverage Target**: 70%+ on critical paths
