import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  LockKeyhole,
  Mail,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
  Undo2,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useForm, type FieldPath, type UseFormSetError } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'
import {
  AuthApiError,
  registerAccount,
  verifyRegistrationOtp,
  type RegisterPayload,
} from '../../services/auth'

const trustPoints = [
  {
    icon: PackageCheck,
    title: '10.000+ sản phẩm',
    description: 'Cập nhật xu hướng mới mỗi tuần',
  },
  {
    icon: Truck,
    title: 'Giao hàng miễn phí',
    description: 'Cho đơn từ 500.000 đ',
  },
  {
    icon: Undo2,
    title: 'Đổi trả 30 ngày',
    description: 'Miễn phí đổi size, hoàn tiền 100%',
  },
  {
    icon: ShieldCheck,
    title: 'Thanh toán bảo mật',
    description: 'Mã hóa SSL, 5 phương thức linh hoạt',
  },
] as const

const phoneRegex = /^(0|\+84)(\s|\.)?\d(?:[\s.]?\d){8,10}$/

const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Vui lòng nhập họ và tên.'),
    email: z.email('Email không hợp lệ.'),
    phone: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập số điện thoại.')
      .regex(phoneRegex, 'Số điện thoại không hợp lệ.'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
      .regex(/[A-Z]/, 'Mật khẩu cần có ít nhất 1 chữ in hoa.')
      .regex(/\d/, 'Mật khẩu cần có ít nhất 1 chữ số.'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu.'),
    agree: z.boolean().refine((value) => value, {
      message: 'Bạn cần đồng ý với điều khoản dịch vụ và chính sách bảo mật.',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  })

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Vui lòng nhập đủ 6 số OTP.')
    .regex(/^\d+$/, 'OTP chỉ gồm chữ số.'),
})

type RegisterFormValues = z.infer<typeof registerSchema>
type OtpFormValues = z.infer<typeof otpSchema>

function BrandLockup() {
  return (
    <Link to="/" className="flex items-center gap-4 transition hover:opacity-95">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#ff9f1a] shadow-[0_18px_40px_-18px_rgba(255,159,26,0.85)]">
        <span className="font-display text-[1.9rem] font-bold leading-none text-white">E</span>
      </div>

      <div>
        <p className="font-display text-[2rem] font-bold leading-none tracking-[0.12em] text-white">
          SHOP
        </p>
        <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.55em] text-[#796b58]">
          Fashion Store
        </p>
      </div>
    </Link>
  )
}

function SocialMark({ provider }: { provider: 'google' | 'facebook' }) {
  if (provider === 'google') {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[0.95rem] font-black text-[#17120d]"
      >
        <span className="bg-[conic-gradient(from_90deg,#4285F4_0_25%,#34A853_25%_50%,#FBBC05_50%_75%,#EA4335_75%_100%)] bg-clip-text text-transparent">
          G
        </span>
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1877f2] text-sm font-black text-white"
    >
      f
    </span>
  )
}

function StepMarker({
  step,
  currentStep,
  label,
}: {
  step: 1 | 2
  currentStep: 1 | 2
  label: string
}) {
  const done = currentStep > step
  const active = currentStep === step

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition',
          done
            ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-400'
            : active
              ? 'border-[#ffad29] bg-[#ff9f1a] text-white'
              : 'border-[#3a3025] bg-[#17120d] text-[#7f715f]',
        )}
      >
        {done ? <Check className="h-4 w-4" /> : step}
      </div>
      <span
        className={cn(
          'text-[0.72rem] font-medium',
          active ? 'text-[#ffad29]' : done ? 'text-[#7bc087]' : 'text-[#756858]',
        )}
      >
        {label}
      </span>
    </div>
  )
}

function InputPrefix({
  children,
  accent = false,
}: {
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute top-2 bottom-2 left-2 z-10 flex w-10 items-center justify-center rounded-[14px] border bg-[#16110c] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
        accent ? 'border-[#3c2d18] text-[#ffad29]' : 'border-[#332718] text-[#b59669]',
      )}
    >
      {children}
    </div>
  )
}

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null

  return <p className="mt-2 text-sm text-[#ff7a59]">{message}</p>
}

function FieldShell({
  children,
  error,
}: {
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-2.5">
      {children}
      <FieldErrorText message={error} />
    </div>
  )
}

function getInputClass(hasError?: boolean) {
  return cn(
    'h-14 rounded-2xl border-[#3b3126] bg-[#0f0f10] text-[1.05rem] text-[#edf3fb] placeholder:text-[#728199] focus:border-[#8b6f38] focus:bg-[#121214]',
    hasError && 'border-[#a64b40] focus:border-[#a64b40]',
  )
}

function applyServerFieldErrors<TFieldValues extends Record<string, unknown>>(
  fieldErrors: Record<string, string>,
  setError: UseFormSetError<TFieldValues>,
  allowedFields: readonly FieldPath<TFieldValues>[],
) {
  const allowed = new Set<string>(allowedFields)

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (!allowed.has(field)) return

    setError(field as FieldPath<TFieldValues>, {
      type: 'server',
      message,
    })
  })
}

function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendIn, setResendIn] = useState(57)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [verificationEmail, setVerificationEmail] = useState('')
  const [verificationId, setVerificationId] = useState<string | undefined>()
  const [registerSubmitError, setRegisterSubmitError] = useState<string | null>(null)
  const [otpSubmitError, setOtpSubmitError] = useState<string | null>(null)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      otp: '',
    },
  })

  const passwordValue = registerForm.watch('password')
  const confirmPasswordValue = registerForm.watch('confirmPassword')

  useEffect(() => {
    if (registerForm.formState.submitCount === 0 || !confirmPasswordValue) return

    void registerForm.trigger('confirmPassword')
  }, [confirmPasswordValue, passwordValue, registerForm])

  useEffect(() => {
    if (step !== 2 || resendIn <= 0) return

    const timer = window.setInterval(() => {
      setResendIn((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [step, resendIn])

  async function handleRegisterSubmit(values: RegisterFormValues) {
    setRegisterSubmitError(null)

    try {
      const payload: RegisterPayload = {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      }

      const response = await registerAccount(payload)

      setVerificationEmail(response.email)
      setVerificationId(response.verificationId)
      setOtpDigits(['', '', '', '', '', ''])
      otpForm.reset({ otp: '' })
      setOtpSubmitError(null)
      setStep(2)
      setResendIn(response.resendInSeconds ?? 57)
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } catch (error) {
      if (error instanceof AuthApiError) {
        applyServerFieldErrors(
          error.fieldErrors,
          registerForm.setError,
          ['fullName', 'email', 'phone', 'password', 'confirmPassword', 'agree'],
        )
        setRegisterSubmitError(error.message)
        return
      }

      setRegisterSubmitError('Không thể xử lý đăng ký. Vui lòng thử lại.')
    }
  }

  async function handleOtpSubmit(values: OtpFormValues) {
    setOtpSubmitError(null)

    try {
      await verifyRegistrationOtp({
        email: verificationEmail || registerForm.getValues('email'),
        verificationId,
        otp: values.otp,
      })

      navigate('/login')
    } catch (error) {
      if (error instanceof AuthApiError) {
        applyServerFieldErrors(error.fieldErrors, otpForm.setError, ['otp'])
        setOtpSubmitError(error.message)
        return
      }

      setOtpSubmitError('Không thể xác thực OTP. Vui lòng thử lại.')
    }
  }

  function updateOtpDigits(nextDigits: string[], options?: { focusIndex?: number; validate?: boolean }) {
    setOtpDigits(nextDigits)
    otpForm.setValue('otp', nextDigits.join(''), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: options?.validate ?? otpForm.formState.isSubmitted,
    })
    otpForm.clearErrors('otp')

    if (typeof options?.focusIndex === 'number') {
      otpRefs.current[options.focusIndex]?.focus()
    }
  }

  function handleOtpChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, '').slice(-1)
    const nextDigits = [...otpDigits]
    nextDigits[index] = value

    updateOtpDigits(nextDigits, {
      focusIndex: value && index < nextDigits.length - 1 ? index + 1 : undefined,
    })
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Backspace') return

    if (otpDigits[index]) {
      const nextDigits = [...otpDigits]
      nextDigits[index] = ''
      updateOtpDigits(nextDigits)
      return
    }

    if (index > 0) {
      const nextDigits = [...otpDigits]
      nextDigits[index - 1] = ''
      updateOtpDigits(nextDigits, { focusIndex: index - 1 })
    }
  }

  async function handleResendOtp() {
    setOtpSubmitError(null)

    try {
      const values = registerForm.getValues()
      const response = await registerAccount({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      })

      setVerificationEmail(response.email)
      setVerificationId(response.verificationId)
      setOtpDigits(['', '', '', '', '', ''])
      otpForm.reset({ otp: '' })
      setResendIn(response.resendInSeconds ?? 57)
      otpRefs.current[0]?.focus()
    } catch (error) {
      if (error instanceof AuthApiError) {
        setOtpSubmitError(error.message)
        return
      }

      setOtpSubmitError('Không thể gửi lại mã OTP. Vui lòng thử lại.')
    }
  }

  const registerErrors = registerForm.formState.errors
  const otpError = otpForm.formState.errors.otp?.message

  return (
    <section className="min-h-screen bg-[#090603] px-4 py-4 text-[#f8f2e7] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-[1440px] overflow-hidden rounded-[28px] border border-[#2f2418] bg-[#0c0907] shadow-[0_32px_90px_-48px_rgba(0,0,0,0.95)]">
        <div className="relative hidden w-[43%] shrink-0 overflow-hidden border-r border-[#2a2118] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,158,27,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,158,27,0.1),transparent_28%)]" />
          <div className="relative flex h-full flex-col px-10 py-14 xl:px-14">
            <BrandLockup />

            <div className="mt-24 max-w-[26rem]">
              <h1 className="font-display text-5xl font-bold leading-[1.08] tracking-[-0.05em] text-white">
                Thời trang <span className="text-[#ffad29]">đỉnh cao</span>
                <br />
                tại E SHOP
              </h1>
              <p className="mt-8 max-w-[24rem] text-[1.35rem] leading-8 text-[#94826d]">
                Hàng ngàn sản phẩm chính hãng, giao hàng nhanh, đổi trả 30 ngày, tất cả
                trong một nền tảng.
              </p>
            </div>

            <div className="mt-14 space-y-5">
              {trustPoints.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-[#4a3214] bg-[#1d140c] text-[#ffad29] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[1.35rem] font-semibold leading-7 text-white">{title}</p>
                    <p className="mt-1 text-lg leading-7 text-[#877663]">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-auto pt-12 text-base text-[#7f715f]">
              © 2025 E SHOP Fashion Store · Tất cả quyền được bảo lưu
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[36rem]">
            <div className="lg:hidden">
              <BrandLockup />
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-start gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <StepMarker step={1} currentStep={step} label="Thông tin" />
                  <div className="mt-4 h-px min-w-0 flex-1 bg-gradient-to-r from-[#3c8a52] via-[#3b3126] to-[#3b3126]" />
                </div>
                <StepMarker step={2} currentStep={step} label="Xác thực" />
              </div>
            </div>

            {step === 1 ? (
              <form className="mt-10" onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} noValidate>
                <h2 className="font-display text-[2.5rem] font-bold tracking-[-0.04em] text-white sm:text-[3rem]">
                  Tạo tài khoản mới
                </h2>
                <p className="mt-3 text-lg text-[#8d7d69] sm:text-[1.32rem]">
                  Mua sắm dễ hơn, theo dõi đơn hàng, lưu yêu thích
                </p>

                <div className="mt-8 space-y-5">
                  <FieldShell error={registerErrors.fullName?.message}>
                    <label htmlFor="fullName" className="meta-label block">
                      Họ và tên <span className="text-[#ff7a59]">*</span>
                    </label>
                    <div className="relative">
                      <InputPrefix accent>
                        <UserRound className="h-4.5 w-4.5" />
                      </InputPrefix>
                      <Input
                        id="fullName"
                        placeholder="Nguyễn Văn A"
                        aria-invalid={Boolean(registerErrors.fullName)}
                        {...registerForm.register('fullName')}
                        className={cn(getInputClass(Boolean(registerErrors.fullName)), 'pl-20 pr-4 bg-[#101010]')}
                      />
                    </div>
                  </FieldShell>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldShell error={registerErrors.email?.message}>
                      <label htmlFor="email" className="meta-label block">
                        Email <span className="text-[#ff7a59]">*</span>
                      </label>
                      <div className="relative">
                        <InputPrefix>
                          <Mail className="h-4.5 w-4.5" />
                        </InputPrefix>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ten@email.com"
                          aria-invalid={Boolean(registerErrors.email)}
                          {...registerForm.register('email')}
                          className={cn(getInputClass(Boolean(registerErrors.email)), 'pl-20 pr-4')}
                        />
                      </div>
                    </FieldShell>

                    <FieldShell error={registerErrors.phone?.message}>
                      <label htmlFor="phone" className="meta-label block">
                        Số điện thoại <span className="text-[#ff7a59]">*</span>
                      </label>
                      <div className="relative">
                        <InputPrefix>
                          <Phone className="h-4.5 w-4.5" />
                        </InputPrefix>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="0901 234 567"
                          aria-invalid={Boolean(registerErrors.phone)}
                          {...registerForm.register('phone')}
                          className={cn(getInputClass(Boolean(registerErrors.phone)), 'pl-20 pr-4')}
                        />
                      </div>
                    </FieldShell>
                  </div>

                  <FieldShell error={registerErrors.password?.message}>
                    <label htmlFor="password" className="meta-label block">
                      Mật khẩu <span className="text-[#ff7a59]">*</span>
                    </label>
                    <div className="relative">
                      <InputPrefix>
                        <LockKeyhole className="h-4.5 w-4.5" />
                      </InputPrefix>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tối thiểu 8 ký tự"
                        aria-invalid={Boolean(registerErrors.password)}
                        {...registerForm.register('password')}
                        className={cn(getInputClass(Boolean(registerErrors.password)), 'pl-20 pr-20')}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#332718] bg-[#16110c] text-[#b59669] transition hover:text-[#f4ead4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </FieldShell>

                  <FieldShell error={registerErrors.confirmPassword?.message}>
                    <label htmlFor="confirmPassword" className="meta-label block">
                      Xác nhận mật khẩu <span className="text-[#ff7a59]">*</span>
                    </label>
                    <div className="relative">
                      <InputPrefix>
                        <LockKeyhole className="h-4.5 w-4.5" />
                      </InputPrefix>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        aria-invalid={Boolean(registerErrors.confirmPassword)}
                        {...registerForm.register('confirmPassword')}
                        className={cn(
                          getInputClass(Boolean(registerErrors.confirmPassword)),
                          'pl-20 pr-20',
                        )}
                      />
                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiển thị mật khẩu xác nhận'
                        }
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#332718] bg-[#16110c] text-[#b59669] transition hover:text-[#f4ead4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </FieldShell>

                  <div>
                    <label className="flex items-start gap-3 text-base leading-7 text-[#92816f]">
                      <input
                        type="checkbox"
                        aria-invalid={Boolean(registerErrors.agree)}
                        {...registerForm.register('agree')}
                        className="mt-1 h-4.5 w-4.5 rounded border border-[#5c4a33] bg-transparent accent-[#ff9419]"
                      />
                      <span>
                        Tôi đồng ý với{' '}
                        <Link
                          to="/"
                          className="font-semibold text-[#ff991b] transition hover:text-[#ffb347]"
                        >
                          Điều khoản dịch vụ
                        </Link>{' '}
                        và{' '}
                        <Link
                          to="/"
                          className="font-semibold text-[#ff991b] transition hover:text-[#ffb347]"
                        >
                          Chính sách bảo mật
                        </Link>
                      </span>
                    </label>
                    <FieldErrorText message={registerErrors.agree?.message} />
                  </div>
                </div>

                {registerSubmitError ? (
                  <p className="mt-4 rounded-2xl border border-[#4b2a23] bg-[#21110d] px-4 py-3 text-sm text-[#ffb2a4]">
                    {registerSubmitError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting}
                  className="mt-6 h-15 w-full rounded-[18px] text-lg font-bold shadow-[0_22px_48px_-24px_rgba(255,145,0,0.95)]"
                >
                  {registerForm.formState.isSubmitting ? 'Đang xử lý...' : 'Tiếp theo - Xác thực OTP'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="my-8 flex items-center gap-4 text-sm text-[#786a59]">
                  <div className="h-px flex-1 bg-[#2f2418]" />
                  <span>hoặc đăng ký với</span>
                  <div className="h-px flex-1 bg-[#2f2418]" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    className="flex min-h-14 items-center justify-center gap-3 rounded-[18px] border border-[#3a3025] bg-transparent px-4 text-base font-semibold text-white transition hover:border-[#7a6130] hover:bg-[#15110d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                  >
                    <SocialMark provider="google" />
                    đăng ký với Google
                  </button>
                  <button
                    type="button"
                    className="flex min-h-14 items-center justify-center gap-3 rounded-[18px] border border-[#3a3025] bg-transparent px-4 text-base font-semibold text-white transition hover:border-[#7a6130] hover:bg-[#15110d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                  >
                    <SocialMark provider="facebook" />
                    đăng ký với Facebook
                  </button>
                </div>

                <p className="mt-10 text-center text-lg text-[#8e7d69]">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-[#ff991b] transition hover:text-[#ffb347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </form>
            ) : (
              <form className="mt-10" onSubmit={otpForm.handleSubmit(handleOtpSubmit)} noValidate>
                <h2 className="font-display text-[2.5rem] font-bold tracking-[-0.04em] text-white sm:text-[3rem]">
                  Xác thực tài khoản
                </h2>
                <p className="mt-3 text-lg text-[#8d7d69] sm:text-[1.32rem]">
                  Mã OTP đã gửi tới{' '}
                  <span className="font-semibold text-white">
                    {verificationEmail || registerForm.getValues('email')}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[#6f6355]">Kiểm tra cả hộp thư Spam nếu không thấy</p>

                <div className="mt-10 flex justify-center gap-3 sm:gap-4">
                  {otpDigits.map((value, index) => (
                    <Input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element
                      }}
                      inputMode="numeric"
                      maxLength={1}
                      value={value}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      aria-invalid={Boolean(otpError)}
                      className={cn(
                        'h-16 w-12 rounded-[16px] border bg-[#0f0f10] px-0 text-center font-mono text-2xl font-bold text-white sm:h-[72px] sm:w-14',
                        value
                          ? 'border-[#ffad29] shadow-[0_0_0_3px_rgba(255,173,41,0.12)]'
                          : 'border-[#3b3126] focus:border-[#8b6f38]',
                        otpError && 'border-[#a64b40] focus:border-[#a64b40]',
                      )}
                    />
                  ))}
                </div>
                <FieldErrorText message={otpError} />

                <div className="mt-3 text-center text-base text-[#8d7d69]">
                  {resendIn > 0 ? (
                    <>
                      Gửi lại sau <span className="font-semibold text-[#ff991b]">{resendIn}s</span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-semibold text-[#ff991b] transition hover:text-[#ffb347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>

                {otpSubmitError ? (
                  <p className="mt-4 rounded-2xl border border-[#4b2a23] bg-[#21110d] px-4 py-3 text-sm text-[#ffb2a4]">
                    {otpSubmitError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={otpForm.formState.isSubmitting}
                  className="mt-8 h-15 w-full rounded-[18px] text-lg font-bold shadow-[0_22px_48px_-24px_rgba(255,145,0,0.95)]"
                >
                  {otpForm.formState.isSubmitting ? 'Đang xác thực...' : 'Xác nhận'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-5 flex w-full items-center justify-center gap-2 text-base text-[#8d7d69] transition hover:text-[#f3e6cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                  Quay lại sửa thông tin
                </button>

                <p className="mt-10 text-center text-lg text-[#8e7d69]">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-[#ff991b] transition hover:text-[#ffb347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage
