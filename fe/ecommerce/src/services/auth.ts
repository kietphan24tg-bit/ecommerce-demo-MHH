export type RegisterPayload = {
  fullName: string
  email: string
  phone: string
  password: string
}

export type RegisterResponse = {
  email: string
  verificationId?: string
  resendInSeconds?: number
  message?: string
}

export type VerifyRegistrationOtpPayload = {
  email: string
  otp: string
  verificationId?: string
}

export type VerifyRegistrationOtpResponse = {
  message?: string
}

type AuthErrorPayload = {
  message: string
  fieldErrors: Record<string, string>
}

export class AuthApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, options?: { status?: number; fieldErrors?: Record<string, string> }) {
    super(message)
    this.name = 'AuthApiError'
    this.status = options?.status ?? 500
    this.fieldErrors = options?.fieldErrors ?? {}
  }
}

const REGISTER_ENDPOINT = import.meta.env.VITE_AUTH_REGISTER_ENDPOINT ?? '/api/auth/register'
const VERIFY_OTP_ENDPOINT =
  import.meta.env.VITE_AUTH_VERIFY_OTP_ENDPOINT ?? '/api/auth/register/verify-otp'

function normalizeFieldName(field: string) {
  switch (field) {
    case 'full_name':
    case 'fullname':
    case 'name':
      return 'fullName'
    case 'phone_number':
    case 'phoneNumber':
    case 'mobile':
      return 'phone'
    case 'confirm_password':
    case 'confirmPassword':
      return 'confirmPassword'
    case 'verification_code':
    case 'verificationCode':
      return 'otp'
    default:
      return field
  }
}

function extractFieldErrorsFromRecord(record: Record<string, unknown>) {
  const fieldErrors: Record<string, string> = {}

  for (const [rawField, value] of Object.entries(record)) {
    const field = normalizeFieldName(rawField)

    if (typeof value === 'string' && value.trim()) {
      fieldErrors[field] = value
      continue
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      fieldErrors[field] = value[0]
    }
  }

  return fieldErrors
}

function parseAuthErrorPayload(payload: unknown): AuthErrorPayload {
  let message = 'Đã có lỗi xảy ra. Vui lòng thử lại.'
  let fieldErrors: Record<string, string> = {}

  if (!payload || typeof payload !== 'object') {
    return { message, fieldErrors }
  }

  const candidate = payload as Record<string, unknown>

  if (typeof candidate.message === 'string' && candidate.message.trim()) {
    message = candidate.message
  }

  if (typeof candidate.detail === 'string' && candidate.detail.trim()) {
    message = candidate.detail
  }

  if (candidate.error && typeof candidate.error === 'object' && !Array.isArray(candidate.error)) {
    const backendError = candidate.error as Record<string, unknown>

    if (typeof backendError.message === 'string' && backendError.message.trim()) {
      message = backendError.message
    }

    if (
      backendError.details &&
      typeof backendError.details === 'object' &&
      !Array.isArray(backendError.details)
    ) {
      fieldErrors = extractFieldErrorsFromRecord(
        backendError.details as Record<string, unknown>,
      )
    }
  }

  if (candidate.errors && typeof candidate.errors === 'object' && !Array.isArray(candidate.errors)) {
    fieldErrors = extractFieldErrorsFromRecord(candidate.errors as Record<string, unknown>)
  }

  if (
    Object.keys(fieldErrors).length === 0 &&
    candidate.detail &&
    Array.isArray(candidate.detail)
  ) {
    fieldErrors = candidate.detail.reduce<Record<string, string>>((accumulator, item) => {
      if (!item || typeof item !== 'object') {
        return accumulator
      }

      const detailItem = item as { loc?: unknown; msg?: unknown }
      const location = Array.isArray(detailItem.loc) ? detailItem.loc : []
      const rawField = location[location.length - 1]

      if (typeof rawField !== 'string' || typeof detailItem.msg !== 'string') {
        return accumulator
      }

      accumulator[normalizeFieldName(rawField)] = detailItem.msg
      return accumulator
    }, {})
  }

  if (Object.keys(fieldErrors).length > 0 && message === 'Đã có lỗi xảy ra. Vui lòng thử lại.') {
    message = 'Vui lòng kiểm tra lại thông tin đã nhập.'
  }

  return { message, fieldErrors }
}

async function requestJson<TResponse>(endpoint: string, payload: unknown): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new AuthApiError('Không thể kết nối tới máy chủ xác thực.', {
      status: 0,
    })
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const responseBody = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const parsed = parseAuthErrorPayload(responseBody)
    throw new AuthApiError(parsed.message, {
      status: response.status,
      fieldErrors: parsed.fieldErrors,
    })
  }

  return (responseBody ?? {}) as TResponse
}

export async function registerAccount(payload: RegisterPayload) {
  const response = await requestJson<Partial<RegisterResponse>>(REGISTER_ENDPOINT, payload)

  return {
    email: response.email ?? payload.email,
    verificationId: response.verificationId,
    resendInSeconds: response.resendInSeconds ?? 57,
    message: response.message,
  } satisfies RegisterResponse
}

export async function verifyRegistrationOtp(payload: VerifyRegistrationOtpPayload) {
  return requestJson<VerifyRegistrationOtpResponse>(VERIFY_OTP_ENDPOINT, payload)
}
