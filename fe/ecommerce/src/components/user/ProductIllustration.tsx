import { cn } from '../../lib/utils'
import { CategoryBadge } from '../shared/CategoryBadge'

type ProductIllustrationProps = {
  category: string
  productId: string
  image?: string
}

const ILLUSTRATION_TONES: Record<
  string,
  { accent: string; glow: string; haze: string }
> = {
  All: {
    accent: 'text-amber-400',
    glow: 'shadow-[0_0_44px_rgba(251,191,36,0.18)]',
    haze: 'bg-amber-400/18',
  },
  'Áo': {
    accent: 'text-amber-300',
    glow: 'shadow-[0_0_44px_rgba(245,158,11,0.18)]',
    haze: 'bg-amber-300/18',
  },
  Quần: {
    accent: 'text-sky-300',
    glow: 'shadow-[0_0_44px_rgba(96,165,250,0.18)]',
    haze: 'bg-sky-300/18',
  },
  Giày: {
    accent: 'text-rose-300',
    glow: 'shadow-[0_0_44px_rgba(251,113,133,0.18)]',
    haze: 'bg-rose-300/18',
  },
  Dép: {
    accent: 'text-teal-300',
    glow: 'shadow-[0_0_44px_rgba(45,212,191,0.18)]',
    haze: 'bg-teal-300/18',
  },
  Túi: {
    accent: 'text-fuchsia-300',
    glow: 'shadow-[0_0_44px_rgba(192,132,252,0.18)]',
    haze: 'bg-fuchsia-300/18',
  },
  'Phụ kiện': {
    accent: 'text-yellow-200',
    glow: 'shadow-[0_0_44px_rgba(250,204,21,0.18)]',
    haze: 'bg-yellow-200/18',
  },
}

function IllustrationGlyph({ category }: Pick<ProductIllustrationProps, 'category'>) {
  switch (category) {
    case 'Áo':
      return (
        <svg viewBox="0 0 220 160" className="h-full w-full" fill="none">
          <path
            d="M86 34 100 24h20l14 10 18 20-18 12-10-12v72H96V54L86 66 68 54l18-20Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M100 24v18M120 24v18M96 84h28"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.68"
          />
        </svg>
      )
    case 'Quần':
      return (
        <svg viewBox="0 0 220 160" className="h-full w-full" fill="none">
          <path
            d="M86 26h48l10 104h-26l-8-48-8 48H76L86 26Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M110 26v26M94 54h32"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.68"
          />
        </svg>
      )
    case 'Giày':
      return (
        <svg viewBox="0 0 220 160" className="h-full w-full" fill="none">
          <path
            d="M64 98h92c12 0 20 8 20 18v8H44v-12c0-8 6-14 14-14h6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M64 98c8 0 16-4 24-12l10-12 18 10c8 4 16 8 24 8h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M92 112h12M112 112h12M132 112h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      )
    case 'Dép':
      return (
        <svg viewBox="0 0 220 160" className="h-full w-full" fill="none">
          <path
            d="M70 96c0-14 12-26 26-26h40c8 0 14 6 14 14v12c0 18-14 32-32 32H96c-14 0-26-12-26-32Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M92 70V52M110 70V44M128 70V52"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.72"
          />
        </svg>
      )
    case 'Túi':
      return (
        <svg viewBox="0 0 220 160" className="h-full w-full" fill="none">
          <path
            d="M72 60h76l8 58H64l8-58Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M90 60V48c0-11 9-20 20-20s20 9 20 20v12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M84 82h52M88 96h44"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.65"
          />
        </svg>
      )
    case 'Phụ kiện':
      return (
        <svg viewBox="0 0 220 160" className="h-full w-full" fill="none">
          <circle cx="86" cy="58" r="18" stroke="currentColor" strokeWidth="2" />
          <circle cx="134" cy="58" r="18" stroke="currentColor" strokeWidth="2" opacity="0.78" />
          <path
            d="M70 58h16M134 58h16M96 58h20"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M74 104c10-14 24-20 36-20s26 6 36 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.72"
          />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 220 160" className="h-full w-full" fill="none">
          <circle cx="110" cy="70" r="38" stroke="currentColor" strokeWidth="2" />
          <path
            d="M110 32v76M72 70h76"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      )
  }
}

export function ProductIllustration({
  category,
  productId,
  image,
}: ProductIllustrationProps) {
  const tone = ILLUSTRATION_TONES[category] ?? ILLUSTRATION_TONES.All

  return (
    <div className="relative h-[218px] overflow-hidden border-b border-white/6 bg-[linear-gradient(180deg,#151008_0%,#100b08_100%)] sm:h-[236px]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,182,56,0.12),transparent_42%)]" />
      <div
        className={cn(
          'absolute inset-x-[18%] top-9 h-28 rounded-full blur-3xl transition duration-500 group-hover:opacity-90 sm:top-10 sm:h-32',
          tone.haze,
        )}
      />

      <div className="absolute right-4 top-4 z-10 sm:right-5 sm:top-5">
        <CategoryBadge category={category} />
      </div>

      <div className="absolute bottom-4 left-4 z-10 rounded-md border border-white/8 bg-[#0c0f14]/82 px-3 py-1.5 font-mono text-[0.76rem] tracking-[0.02em] text-[#8690a4] backdrop-blur-sm sm:left-5">
        {productId}
      </div>

      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition duration-500 group-hover:scale-[1.03]',
          tone.accent,
        )}
      >
        {image ? (
          <div
            className={cn(
              'relative h-[148px] w-[186px] overflow-hidden sm:h-[164px] sm:w-[198px]',
              tone.glow,
            )}
          >
            <img
              src={image}
              alt={productId}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ) : (
          <div
            className={cn(
              'relative flex h-[148px] w-[186px] items-center justify-center sm:h-[164px] sm:w-[198px]',
              tone.glow,
            )}
          >
            <IllustrationGlyph category={category} />
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d1117] to-transparent" />
    </div>
  )
}
