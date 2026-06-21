import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  Truck,
  Undo2,
} from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'

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

const emailSchema = z.object({
  email: z.email('Email không hợp lệ.'),
})

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Vui lòng nhập đủ 6 số OTP.')
    .regex(/^\d+$/, 'OTP chỉ gồm chữ số.'),
})

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
      .regex(/[A-Z]/, 'Mật khẩu cần có ít nhất 1 chữ in hoa.')
      .regex(/\d/, 'Mật khẩu cần có ít nhất 1 chữ số.'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  })

type EmailFormValues = z.infer<typeof emailSchema>
type OtpFormValues = z.infer<typeof otpSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

const stepConfig = [
  { title: 'Quên mật khẩu', sub: 'Nhập email để nhận mã xác thực' },
  { title: 'Nhập mã OTP', sub: 'otp' },
  { title: 'Đặt mật khẩu mới', sub: 'Nhập mật khẩu mới cho tài khoản' },
] as const

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

function StepProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1">
      {([1, 2, 3] as const).map((s) => (
        <div
          key={s}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors duration-300',
            step >= s ? 'bg-[#ffad29]' : 'bg-[#3b3126]',
          )}
        />
      ))}
    </div>
  )
}

function InputPrefix({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute top-2 bottom-2 left-2 z-10 flex w-10 items-center justify-center rounded-[14px] border border-[#332718] bg-[#16110c] text-[#b59669] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
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

function SuccessView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/35 bg-emerald-500/12">
        <Check className="h-7 w-7 text-emerald-400" />
      </div>
      <h3 className="font-display text-xl font-bold text-white">
        Đặt lại mật khẩu thành công!
      </h3>
      <p className="mt-2 text-sm text-[#8d7d69]">Bạn có thể đăng nhập với mật khẩu mới.</p>
      <Button
        type="button"
        onClick={onLogin}
        className="mt-6 h-13 rounded-[18px] px-8 text-base font-bold shadow-[0_22px_48px_-24px_rgba(255,145,0,0.95)]"
      >
        Đăng nhập ngay
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  )
}

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [done, setDone] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    mode: 'onSubmit',
    defaultValues: { email: '' },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    mode: 'onSubmit',
    defaultValues: { otp: '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onSubmit',
    defaultValues: { password: '', confirmPassword: '' },
  })

  const passwordValue = passwordForm.watch('password')
  const confirmPasswordValue = passwordForm.watch('confirmPassword')

  useEffect(() => {
    if (passwordForm.formState.submitCount === 0 || !confirmPasswordValue) return
    void passwordForm.trigger('confirmPassword')
  }, [confirmPasswordValue, passwordValue, passwordForm])

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

  async function handleEmailSubmit(values: EmailFormValues) {
    await new Promise((resolve) => window.setTimeout(resolve, 1200))
    setVerificationEmail(values.email.trim())
    setOtpDigits(['', '', '', '', '', ''])
    otpForm.reset({ otp: '' })
    setStep(2)
    setResendIn(60)
    window.setTimeout(() => otpRefs.current[0]?.focus(), 50)
  }

  async function handleOtpSubmit(values: OtpFormValues) {
    await new Promise((resolve) => window.setTimeout(resolve, 1000))
    void values
    setStep(3)
  }

  async function handlePasswordSubmit(_values: PasswordFormValues) {
    await new Promise((resolve) => window.setTimeout(resolve, 1200))
    setDone(true)
  }

  async function handleResendOtp() {
    await new Promise((resolve) => window.setTimeout(resolve, 800))
    setOtpDigits(['', '', '', '', '', ''])
    otpForm.reset({ otp: '' })
    setResendIn(60)
    otpRefs.current[0]?.focus()
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

  const emailErrors = emailForm.formState.errors
  const otpError = otpForm.formState.errors.otp?.message
  const passwordErrors = passwordForm.formState.errors
  const currentConfig = stepConfig[step - 1]

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

            {done ? (
              <div className="mt-10 lg:mt-0">
                <SuccessView onLogin={() => navigate('/login')} />
              </div>
            ) : (
              <div className="mt-10 lg:mt-0">
                <StepProgress step={step} />

                <h2 className="mt-6 font-display text-[2.5rem] font-bold tracking-[-0.04em] text-white sm:text-[3rem]">
                  {currentConfig.title}
                </h2>
                <p className="mt-3 text-lg text-[#8d7d69] sm:text-[1.32rem]">
                  {currentConfig.sub === 'otp' ? (
                    <>
                      Mã đã gửi tới{' '}
                      <span className="font-semibold text-white">{verificationEmail}</span>
                    </>
                  ) : (
                    currentConfig.sub
                  )}
                </p>

                {step === 1 && (
                  <form
                    className="mt-8"
                    onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                    noValidate
                  >
                    <FieldShell error={emailErrors.email?.message}>
                      <label htmlFor="forgot-email" className="meta-label block">
                        Email đã đăng ký <span className="text-[#ff7a59]">*</span>
                      </label>
                      <div className="relative">
                        <InputPrefix>
                          <Mail className="h-4.5 w-4.5" />
                        </InputPrefix>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="ten@email.com"
                          aria-invalid={Boolean(emailErrors.email)}
                          {...emailForm.register('email')}
                          className={cn(getInputClass(Boolean(emailErrors.email)), 'pl-20 pr-4')}
                        />
                      </div>
                    </FieldShell>

                    <Button
                      type="submit"
                      disabled={emailForm.formState.isSubmitting}
                      className="mt-2 h-15 w-full rounded-[18px] text-lg font-bold shadow-[0_22px_48px_-24px_rgba(255,145,0,0.95)]"
                    >
                      {emailForm.formState.isSubmitting ? 'Đang gửi…' : 'Gửi mã xác thực'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                )}

                {step === 2 && (
                  <form
                    className="mt-8"
                    onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
                    noValidate
                  >
                    <div className="flex justify-center gap-3 sm:gap-4">
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
                          Gửi lại sau{' '}
                          <span className="font-semibold text-[#ff991b]">{resendIn}s</span>
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

                    <Button
                      type="submit"
                      disabled={otpForm.formState.isSubmitting}
                      className="mt-8 h-15 w-full rounded-[18px] text-lg font-bold shadow-[0_22px_48px_-24px_rgba(255,145,0,0.95)]"
                    >
                      {otpForm.formState.isSubmitting ? 'Đang xác thực…' : 'Xác nhận OTP'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                )}

                {step === 3 && (
                  <form
                    className="mt-8 space-y-5"
                    onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                    noValidate
                  >
                    <FieldShell error={passwordErrors.password?.message}>
                      <label htmlFor="new-password" className="meta-label block">
                        Mật khẩu mới <span className="text-[#ff7a59]">*</span>
                      </label>
                      <div className="relative">
                        <InputPrefix>
                          <LockKeyhole className="h-4.5 w-4.5" />
                        </InputPrefix>
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Tối thiểu 8 ký tự"
                          aria-invalid={Boolean(passwordErrors.password)}
                          {...passwordForm.register('password')}
                          className={cn(
                            getInputClass(Boolean(passwordErrors.password)),
                            'pl-20 pr-20',
                          )}
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

                    <FieldShell error={passwordErrors.confirmPassword?.message}>
                      <label htmlFor="confirm-new-password" className="meta-label block">
                        Xác nhận mật khẩu <span className="text-[#ff7a59]">*</span>
                      </label>
                      <div className="relative">
                        <InputPrefix>
                          <LockKeyhole className="h-4.5 w-4.5" />
                        </InputPrefix>
                        <Input
                          id="confirm-new-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Nhập lại mật khẩu"
                          aria-invalid={Boolean(passwordErrors.confirmPassword)}
                          {...passwordForm.register('confirmPassword')}
                          className={cn(
                            getInputClass(Boolean(passwordErrors.confirmPassword)),
                            'pl-20 pr-20',
                          )}
                        />
                        <button
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? 'Ẩn mật khẩu xác nhận'
                              : 'Hiển thị mật khẩu xác nhận'
                          }
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#332718] bg-[#16110c] text-[#b59669] transition hover:text-[#f4ead4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </FieldShell>

                    <Button
                      type="submit"
                      disabled={passwordForm.formState.isSubmitting}
                      className="h-15 w-full rounded-[18px] text-lg font-bold shadow-[0_22px_48px_-24px_rgba(255,145,0,0.95)]"
                    >
                      {passwordForm.formState.isSubmitting ? 'Đang lưu…' : 'Đặt mật khẩu mới'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                )}

                <Link
                  to="/login"
                  className="mt-4 flex w-full items-center justify-center gap-2 text-base text-[#8d7d69] transition hover:text-[#f3e6cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                  Quay lại đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ForgotPasswordPage
