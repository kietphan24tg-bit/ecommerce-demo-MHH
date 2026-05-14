import type { Product, ProductFilters, ProductFormValues } from '../types/product'

export type CountryOption = {
  value: string
  label: string
}

const PRODUCT_IMAGE_THEMES: Record<
  string,
  { accent: string; glow: string; panel: string; icon: string }
> = {
  'Áo': {
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.24)',
    panel: '#2a1707',
    icon: 'shirt',
  },
  Quần: {
    accent: '#60a5fa',
    glow: 'rgba(96,165,250,0.24)',
    panel: '#10192b',
    icon: 'pants',
  },
  Giày: {
    accent: '#fb7185',
    glow: 'rgba(251,113,133,0.24)',
    panel: '#291119',
    icon: 'shoe',
  },
  Dép: {
    accent: '#2dd4bf',
    glow: 'rgba(45,212,191,0.22)',
    panel: '#08201c',
    icon: 'sandal',
  },
  Túi: {
    accent: '#c084fc',
    glow: 'rgba(192,132,252,0.24)',
    panel: '#21112a',
    icon: 'bag',
  },
  'Phụ kiện': {
    accent: '#facc15',
    glow: 'rgba(250,204,21,0.2)',
    panel: '#2a2408',
    icon: 'accessory',
  },
}

const PRODUCT_IMAGE_ICONS: Record<string, string> = {
  accessory:
    '<circle cx="86" cy="58" r="18" stroke="currentColor" stroke-width="2"/><circle cx="134" cy="58" r="18" stroke="currentColor" stroke-width="2" opacity="0.78"/><path d="M70 58h16M134 58h16M96 58h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M74 104c10-14 24-20 36-20s26 6 36 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.72"/>',
  bag:
    '<path d="M72 60h76l8 58H64l8-58Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M90 60V48c0-11 9-20 20-20s20 9 20 20v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M84 82h52M88 96h44" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.65"/>',
  pants:
    '<path d="M86 26h48l10 104h-26l-8-48-8 48H76L86 26Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M110 26v26M94 54h32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.68"/>',
  sandal:
    '<path d="M70 96c0-14 12-26 26-26h40c8 0 14 6 14 14v12c0 18-14 32-32 32H96c-14 0-26-12-26-32Z" stroke="currentColor" stroke-width="2"/><path d="M92 70V52M110 70V44M128 70V52" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.72"/>',
  shirt:
    '<path d="M86 34 100 24h20l14 10 18 20-18 12-10-12v72H96V54L86 66 68 54l18-20Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M100 24v18M120 24v18M96 84h28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.68"/>',
  shoe:
    '<path d="M64 98h92c12 0 20 8 20 18v8H44v-12c0-8 6-14 14-14h6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M64 98c8 0 16-4 24-12l10-12 18 10c8 4 16 8 24 8h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M92 112h12M112 112h12M132 112h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>',
}

export function createProductImage(category: string) {
  const theme = PRODUCT_IMAGE_THEMES[category] ?? PRODUCT_IMAGE_THEMES['Áo']
  const icon = PRODUCT_IMAGE_ICONS[theme.icon] ?? PRODUCT_IMAGE_ICONS.shirt
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" fill="none">
      <rect width="640" height="420" fill="#120d0a"/>
      <rect width="640" height="420" fill="url(#bg)"/>
      <g opacity="0.24">
        <path d="M0 52H640M0 120H640M0 188H640M0 256H640M0 324H640M68 0V420M136 0V420M204 0V420M272 0V420M340 0V420M408 0V420M476 0V420M544 0V420" stroke="rgba(255,255,255,0.18)"/>
      </g>
      <rect x="168" y="66" width="304" height="238" fill="${theme.panel}" opacity="0.74"/>
      <ellipse cx="320" cy="116" rx="160" ry="88" fill="${theme.glow}"/>
      <g color="${theme.accent}">
        <g transform="translate(210 82) scale(0.95)">
          ${icon}
        </g>
      </g>
      <defs>
        <linearGradient id="bg" x1="320" y1="0" x2="320" y2="420" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1b120c"/>
          <stop offset="1" stop-color="#0d1016"/>
        </linearGradient>
      </defs>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function normalizeCategoryKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
}

function createImageVariant(image: string, variant: 'main' | 'studio' | 'detail') {
  if (!image.startsWith('http')) {
    return image
  }

  const separator = image.includes('?') ? '&' : '?'

  if (variant === 'studio') {
    return `${image}${separator}sat=-10&crop=entropy&fit=crop`
  }

  if (variant === 'detail') {
    return `${image}${separator}sat=20&crop=faces,entropy&fit=crop`
  }

  return image
}

export function createProductMockData(
  input: Pick<Product, 'name' | 'image' | 'country' | 'category' | 'rating'>,
) {
  const categoryKey = normalizeCategoryKey(input.category)

  const colorMap: Record<string, Product['colors']> = {
    ao: [
      { name: 'Kem vani', hex: '#dcc7a1' },
      { name: 'Den onyx', hex: '#18181b' },
      { name: 'Nau dat', hex: '#8b5e34' },
      { name: 'Xanh reu', hex: '#2f6b55' },
    ],
    quan: [
      { name: 'Vang dat', hex: '#f4b321' },
      { name: 'Xanh cobalt', hex: '#2d5bd1' },
      { name: 'Than dam', hex: '#232326' },
      { name: 'Nau cognac', hex: '#a36d42' },
    ],
    giay: [
      { name: 'Trang suong', hex: '#e7e5e4' },
      { name: 'Den carbon', hex: '#111827' },
      { name: 'Do gac', hex: '#b91c1c' },
      { name: 'Xanh bang', hex: '#7dd3fc' },
    ],
    dep: [
      { name: 'Cat nhat', hex: '#f5deb3' },
      { name: 'Xanh ngoc', hex: '#14b8a6' },
      { name: 'Den nham', hex: '#18181b' },
      { name: 'Kem sua', hex: '#d6d3d1' },
    ],
    tui: [
      { name: 'Nau cacao', hex: '#6f4e37' },
      { name: 'Den muc', hex: '#111827' },
      { name: 'Kem cat', hex: '#d6d3c7' },
      { name: 'Do ruou', hex: '#7f1d1d' },
    ],
    'phu kien': [
      { name: 'Vang dat', hex: '#f4b321' },
      { name: 'Xanh dien', hex: '#2d5bd1' },
      { name: 'Than dam', hex: '#232326' },
      { name: 'Nau da', hex: '#a36d42' },
    ],
  }

  const defaultColors = colorMap[categoryKey] ?? colorMap['phu kien']

  const normalizedName = normalizeCategoryKey(input.name)

  let sizes: string[]
  let sizeGuide: string
  if (categoryKey === 'ao') {
    if (normalizedName.includes('bomber') || normalizedName.includes('khoac')) {
      sizes = ['M', 'L', 'XL']
      sizeGuide =
        'Form outerwear thiên rộng. Nếu có mặc layering dày bên trong, nên tăng thêm 1 size.'
    } else if (normalizedName.includes('len')) {
      sizes = ['S', 'M', 'L']
      sizeGuide = 'Áo len ôm thân vừa phải. Nếu thích cảm giác thoải mái hơn, nên tăng 1 size.'
    } else {
      sizes = ['S', 'M', 'L', 'XL']
      sizeGuide = 'Form regular unisex khá chuẩn. Size M thường là lựa chọn cân bằng nhất.'
    }
  } else if (categoryKey === 'giay') {
    if (normalizedName.includes('boots')) {
      sizes = ['40', '41', '42', '43']
      sizeGuide =
        'Boots ôm mu bàn chân hơn sneaker. Nếu đi tất dày, nên tăng nửa đến một size.'
    } else {
      sizes = ['39', '40', '41', '42', '43']
      sizeGuide = 'Form giày chuẩn. Size 41 phù hợp với bàn chân nam trung bình.'
    }
  } else if (categoryKey === 'dep') {
    sizes = ['39', '40', '41', '42', '43']
    sizeGuide =
      'Dép đi thoải mái hơn khi dư nhẹ phần gót. Nếu phân vân giữa hai size, chọn size lớn hơn.'
  } else if (categoryKey === 'quan') {
    if (normalizedName.includes('jeans') || normalizedName.includes('cargo')) {
      sizes = ['29', '30', '31', '32', '34']
      sizeGuide =
        'Chọn theo vòng eo. Nếu thích form relaxed hoặc mặc hạ hông, có thể tăng 1 size.'
    } else if (normalizedName.includes('short')) {
      sizes = ['S', 'M', 'L', 'XL']
      sizeGuide = 'Short cạp vừa, ống thoáng. Size M là lựa chọn an toàn cho form regular.'
    } else {
      sizes = ['S', 'M', 'L', 'XL']
      sizeGuide = 'Quần suông đẹp nhất khi vừa eo. Nếu muốn rơi ống nhiều hơn, tăng 1 size.'
    }
  } else if (categoryKey === 'tui') {
    sizes = ['One size']
    sizeGuide = 'Mẫu túi này dùng kích thước cố định, bạn chỉ cần chọn màu phù hợp outfit.'
  } else if (categoryKey === 'phu kien') {
    if (
      normalizedName.includes('that lung') ||
      normalizedName.includes('belt') ||
      normalizedName.includes('lung')
    ) {
      sizes = ['90', '95', '100', '105']
      sizeGuide = 'Chọn theo vòng eo quần. Size 95 hợp waist 29-30, size 100 hợp 31-32.'
    } else if (normalizedName.includes('mu')) {
      sizes = ['S-M', 'M-L']
      sizeGuide = 'Nón có khóa chỉnh phía sau, chỉ cần chọn theo chu vi đầu gần đúng.'
    } else {
      sizes = ['One size']
      sizeGuide = 'Phụ kiện này dùng kích thước tiêu chuẩn, không cần chọn size số.'
    }
  } else {
    sizes = ['S', 'M', 'L', 'XL']
    sizeGuide = 'Size chạy khá chuẩn. Nếu thích mặc rộng hơn, có thể tăng 1 size.'
  }

  void sizeGuide

  const benefits: Product['benefits'] = [
    { title: 'Miễn phí vận chuyển', description: 'Đơn từ 500.000 đ' },
    { title: 'Đổi trả 30 ngày', description: 'Miễn phí đổi size' },
    { title: 'Hàng chính hãng', description: 'Bảo hành 6 tháng' },
  ]

  return {
    images: [
      createImageVariant(input.image, 'main'),
      createImageVariant(input.image, 'studio'),
      createImageVariant(input.image, 'detail'),
    ],
    colors: defaultColors,
    sizes,
    benefits,
    tags: [
      input.category,
      `Xuất xứ: ${input.country}`,
      `Đánh giá ${input.rating}/5`,
      sizes[0] === 'One size' ? 'Phối linh hoạt' : 'Fit linh hoạt',
    ],
    sizeGuide:
      sizes[0] === 'One size'
        ? 'Mẫu này dùng kích thước tiêu chuẩn, bạn chỉ cần chọn màu phù hợp.'
        : `Bảng size cho ${input.category.toLowerCase()} này chạy khá chuẩn, nếu thích mặc rộng hơn có thể tăng 1 size.`,
  }
}

function withProductMockData(
  product: Omit<
    Product,
    'images' | 'colors' | 'sizes' | 'benefits' | 'tags' | 'sizeGuide'
  >,
): Product {
  return {
    ...product,
    ...createProductMockData(product),
  }
}

const BASE_PRODUCTS = [
  {
    id: 'fashion-001',
    name: 'Áo thun unisex Essential Cotton',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    cost: 320000,
    description: 'Áo thun form regular từ cotton mềm, dễ phối cùng quần jeans hoặc short mỗi ngày.',
    country: 'Vietnam',
    category: 'Áo',
    rating: 4,
  },
  {
    id: 'fashion-002',
    name: 'Áo sơ mi Oxford tay dài',
    image:
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80',
    cost: 590000,
    description: 'Sơ mi Oxford đứng dáng, hợp đi làm lẫn mặc smart casual cuối tuần.',
    country: 'Thailand',
    category: 'Áo',
    rating: 4,
  },
  {
    id: 'fashion-003',
    name: 'Áo len gân cổ tròn Autumn Fit',
    image:
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
    cost: 680000,
    description: 'Áo len dệt gân ôm vừa, giữ ấm nhẹ và lên phom gọn cho mùa se lạnh.',
    country: 'Korea',
    category: 'Áo',
    rating: 5,
  },
  {
    id: 'fashion-004',
    name: 'Áo khoác bomber Urban Layer',
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
    cost: 1250000,
    description: 'Bomber vải dày vừa, chống gió nhẹ, hợp outfit streetwear nam nữ.',
    country: 'China',
    category: 'Áo',
    rating: 5,
  },
  {
    id: 'fashion-005',
    name: 'Quần jeans straight Indigo 90s',
    image:
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
    cost: 760000,
    description: 'Quần jeans ống đứng wash xanh đậm, dễ phối với áo thun, áo sơ mi và sneaker.',
    country: 'Vietnam',
    category: 'Quần',
    rating: 5,
  },
  {
    id: 'fashion-006',
    name: 'Quần tây suông Modern Office',
    image:
      'https://images.unsplash.com/photo-1506629905607-d9c297d6dd01?auto=format&fit=crop&w=900&q=80',
    cost: 820000,
    description: 'Quần tây suông nhẹ, ly trước sắc nét, phù hợp môi trường công sở hiện đại.',
    country: 'Japan',
    category: 'Quần',
    rating: 4,
  },
  {
    id: 'fashion-007',
    name: 'Quần cargo túi hộp Terrain',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    cost: 890000,
    description: 'Cargo form relaxed với nhiều túi hộp, hợp phong cách utility và năng động.',
    country: 'China',
    category: 'Quần',
    rating: 4,
  },
  {
    id: 'fashion-008',
    name: 'Quần short linen Resort',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    cost: 420000,
    description: 'Short linen thoáng mát cho mùa hè, mặc đi biển hoặc dạo phố đều ổn.',
    country: 'Thailand',
    category: 'Quần',
    rating: 3,
  },
  {
    id: 'fashion-009',
    name: 'Sneaker trắng Everyday Court',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    cost: 1450000,
    description: 'Sneaker trắng tối giản, đế êm, dùng tốt cho nhu cầu đi làm và đi chơi hằng ngày.',
    country: 'Vietnam',
    category: 'Giày',
    rating: 5,
  },
  {
    id: 'fashion-010',
    name: 'Giày chạy bộ Air Flex',
    image:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    cost: 1890000,
    description: 'Giày chạy bộ nhẹ, upper thoáng khí, đệm êm cho chạy ngắn và tập gym.',
    country: 'USA',
    category: 'Giày',
    rating: 5,
  },
  {
    id: 'fashion-011',
    name: 'Loafer da mềm Milano',
    image:
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80',
    cost: 2150000,
    description: 'Loafer da mềm với phom thanh lịch, phù hợp trang phục smart casual và formal.',
    country: 'Italy',
    category: 'Giày',
    rating: 4,
  },
  {
    id: 'fashion-012',
    name: 'Chelsea boots da lỳ',
    image:
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=900&q=80',
    cost: 2450000,
    description: 'Boots cổ thấp với thun co giãn, tạo silhouette gọn và đứng dáng.',
    country: 'Spain',
    category: 'Giày',
    rating: 5,
  },
  {
    id: 'fashion-013',
    name: 'Dép slide Cloud Comfort',
    image:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80',
    cost: 290000,
    description: 'Dép slide đế mềm, hợp dùng hằng ngày trong nhà hoặc đi nhanh ra ngoài.',
    country: 'Vietnam',
    category: 'Dép',
    rating: 4,
  },
  {
    id: 'fashion-014',
    name: 'Sandal dây bản mảnh Summer Loop',
    image:
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80',
    cost: 540000,
    description: 'Sandal dây bản mảnh, nhẹ chân và phù hợp các outfit mùa hè tối giản.',
    country: 'Indonesia',
    category: 'Dép',
    rating: 4,
  },
  {
    id: 'fashion-015',
    name: 'Dép quai ngang Trek Foam',
    image:
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80',
    cost: 390000,
    description: 'Dép quai ngang đế foam êm, phong cách casual và dễ bảo quản.',
    country: 'Thailand',
    category: 'Dép',
    rating: 3,
  },
  {
    id: 'fashion-016',
    name: 'Túi tote canvas Daily Carry',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
    cost: 450000,
    description: 'Túi tote canvas cứng cáp, đủ sức chứa laptop 13 inch và đồ cá nhân.',
    country: 'Vietnam',
    category: 'Túi',
    rating: 4,
  },
  {
    id: 'fashion-017',
    name: 'Túi đeo chéo mini Metro Sling',
    image:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
    cost: 620000,
    description: 'Túi đeo chéo gọn nhẹ cho điện thoại, ví và phụ kiện cơ bản khi ra phố.',
    country: 'Korea',
    category: 'Túi',
    rating: 4,
  },
  {
    id: 'fashion-018',
    name: 'Túi da vai mềm Luna Hobo',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
    cost: 1680000,
    description: 'Túi vai dáng hobo mềm, tạo điểm nhấn cho outfit tối giản và thanh lịch.',
    country: 'Italy',
    category: 'Túi',
    rating: 5,
  },
  {
    id: 'fashion-019',
    name: 'Mũ lưỡi trai Twill Classic',
    image:
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
    cost: 260000,
    description: 'Mũ lưỡi trai twill cơ bản, dễ phối với áo thun, hoodie và bomber.',
    country: 'China',
    category: 'Phụ kiện',
    rating: 4,
  },
  {
    id: 'fashion-020',
    name: 'Thắt lưng da khóa kim Heritage',
    image:
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80',
    cost: 580000,
    description: 'Thắt lưng da mặt mịn với khóa kim cổ điển, phù hợp quần jeans và quần tây.',
    country: 'Italy',
    category: 'Phụ kiện',
    rating: 4,
  },
  {
    id: 'fashion-021',
    name: 'Kính mát gọng vuông Coastline',
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
    cost: 920000,
    description: 'Kính mát gọng vuông hiện đại, hợp trang phục nghỉ dưỡng và casual citywear.',
    country: 'France',
    category: 'Phụ kiện',
    rating: 5,
  },
  {
    id: 'fashion-022',
    name: 'Khăn choàng mỏng Soft Layer',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    cost: 350000,
    description: 'Khăn choàng mỏng chất liệu mềm nhẹ, thêm lớp hoàn thiện cho outfit thu đông.',
    country: 'Japan',
    category: 'Phụ kiện',
    rating: 3,
  },
]

export const INITIAL_PRODUCTS: Product[] = BASE_PRODUCTS.map(withProductMockData)

export const MAX_COST = 2500000
export const COST_STEP = 50000

export const COUNTRIES = ['All', ...new Set(INITIAL_PRODUCTS.map((product) => product.country))]
export const CATEGORIES = ['All', ...new Set(INITIAL_PRODUCTS.map((product) => product.category))]
export const ADMIN_COUNTRIES = COUNTRIES.filter((country) => country !== 'All')
export const ADMIN_CATEGORIES = CATEGORIES.filter((category) => category !== 'All')

export const DEFAULT_FILTERS: ProductFilters = {
  country: 'All',
  costMin: 0,
  description: '',
  category: 'All',
  rating: '',
}

export const DEFAULT_PRODUCT_FORM: ProductFormValues = {
  name: '',
  image: '',
  cost: '',
  description: '',
  country: 'Vietnam',
  category: 'Áo',
  rating: '',
}

export const CATEGORY_COLORS: Record<string, string> = {
  All: 'border-stone-400/30 bg-stone-400/10 text-stone-200',
  'Áo': 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  Quần: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  Giày: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  Dép: 'border-teal-400/30 bg-teal-400/10 text-teal-200',
  Túi: 'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200',
  'Phụ kiện': 'border-yellow-300/30 bg-yellow-300/10 text-yellow-100',
}

export const CATEGORY_LABELS: Record<string, string> = {
  All: 'Tất cả',
  'Áo': 'Áo',
  Quần: 'Quần',
  Giày: 'Giày',
  Dép: 'Dép',
  Túi: 'Túi',
  'Phụ kiện': 'Phụ kiện',
}

export const COUNTRY_LABELS: Record<string, string> = {
  All: 'Tất cả',
  China: 'Trung Quốc',
  France: 'Pháp',
  Indonesia: 'Indonesia',
  Italy: 'Italy',
  Japan: 'Nhật Bản',
  Korea: 'Hàn Quốc',
  Spain: 'Tây Ban Nha',
  Thailand: 'Thái Lan',
  USA: 'Mỹ',
  Vietnam: 'Việt Nam',
}

export const COUNTRY_STORAGE_KEY = 'market:countries:v1'
export const COUNTRY_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7
export const COUNTRY_API_URL =
  'https://restcountries.com/v3.1/all?fields=name,translations'

export function normalizeCountryName(value: string) {
  const normalized = value.trim().toLowerCase()

  if (
    normalized === 'usa' ||
    normalized === 'us' ||
    normalized === 'united states' ||
    normalized === 'united states of america'
  ) {
    return 'united states'
  }

  if (
    normalized === 'korea' ||
    normalized === 'south korea' ||
    normalized === 'republic of korea' ||
    normalized === 'korea, republic of'
  ) {
    return 'south korea'
  }

  return normalized
}

export const DEFAULT_COUNTRY_OPTIONS: CountryOption[] = COUNTRIES.map((country) => ({
  value: country,
  label: COUNTRY_LABELS[country] ?? country,
}))

export const PRODUCT_COPY: Record<
  string,
  { name: string; description: string; category?: string }
> = {}
