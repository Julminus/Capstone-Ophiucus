import React, { useState, useMemo } from 'react'

// Types
interface Product {
  id: string
  name: string
  category: 'Signature' | 'Manual Brew' | 'Non-Coffee' | 'Pastry & Snack'
  note: string
  price: number
  badge?: string
  image: string
  rating: number
  reviewsCount: number
  tags: string[]
  caffeine: string
}

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  sugar: 'Normal' | 'Less Sugar' | 'No Sugar'
  ice: 'Normal Ice' | 'Less Ice' | 'Hot'
  quantity: number
}

interface TrackingInfo {
  id: string
  gedung: string
  lantai: string
  courierName: string
  courierPhone: string
  step: number
  eta: string
  items: string[]
}

// Zero-dependency pure SVG icons (100% React 19 safe)
type IconName =
  | 'coffee'
  | 'bag'
  | 'sparkles'
  | 'clock'
  | 'mapPin'
  | 'search'
  | 'arrowRight'
  | 'checkCircle'
  | 'star'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'x'
  | 'bike'
  | 'building'
  | 'chevronDown'
  | 'message'

function Icon({
  name,
  className = 'w-5 h-5',
  fill = 'none',
}: {
  name: IconName
  className?: string
  fill?: string
}) {
  const icons: Record<IconName, React.ReactNode> = {
    coffee: (
      <>
        <path d="M10 2v2" />
        <path d="M14 2v2" />
        <path d="M6 2v2" />
        <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      </>
    ),
    bag: (
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
    sparkles: (
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    mapPin: (
      <>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    checkCircle: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    star: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    plus: (
      <>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </>
    ),
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    bike: (
      <>
        <circle cx="18.5" cy="17.5" r="3.5" />
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="15" cy="5" r="1" />
        <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
      </>
    ),
    building: (
      <>
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
      </>
    ),
    chevronDown: <path d="m6 9 6 6 6-6" />,
    message: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aren Cloud Latte',
    category: 'Signature',
    note: 'Double shot espresso, gula aren organik murni, dengan topping cold cloud foam lembut gurih.',
    price: 22000,
    badge: 'Best Seller #1',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 420,
    tags: ['Creamy', 'Gula Aren', 'Favorit Kantor'],
    caffeine: 'Medium',
  },
  {
    id: 'prod-2',
    name: 'Sea Salt Caramel Macchiato',
    category: 'Signature',
    note: 'Espresso robusta-arabika, homemade salted caramel syrup, & sea salt cream foam seimbang.',
    price: 24000,
    badge: 'Favorit Staff PHR',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 310,
    tags: ['Savory Sweet', 'Salted Foam'],
    caffeine: 'Medium',
  },
  {
    id: 'prod-3',
    name: "Kopi Susu WE'TU (Klasik)",
    category: 'Signature',
    note: "Resep otentik WE'TU: Kopi bold mantap, susu kental gurih, manis pas untuk teman kerja seharian.",
    price: 20000,
    badge: 'Daily Booster',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 540,
    tags: ['Bold', 'Milky', 'Ekonomis'],
    caffeine: 'High',
  },
  {
    id: 'prod-4',
    name: 'V60 Gayo Winey Process',
    category: 'Manual Brew',
    note: 'Single origin Arabika Gayo fermentasi winey: Notes fermented grape, floral jasmine, & clean finish.',
    price: 28000,
    badge: 'Specialty Coffee',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewsCount: 128,
    tags: ['Fruity', 'Floral', 'Pour Over'],
    caffeine: 'High',
  },
  {
    id: 'prod-5',
    name: 'Japanese Cold Drip Flores',
    category: 'Manual Brew',
    note: 'Drip manual di atas es batu kristal: karakter citrus segar, hint cocoa nibs, menyegarkan siang hari.',
    price: 26000,
    badge: 'Segar & Bersih',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 95,
    tags: ['Citrus', 'Iced Filter', 'Bright'],
    caffeine: 'Medium',
  },
  {
    id: 'prod-6',
    name: 'Uji Matcha Cloud Milk',
    category: 'Non-Coffee',
    note: 'Ceremonial grade matcha asli Kyoto dipadu susu segar dingin dan velvet cream foam di atasnya.',
    price: 25000,
    badge: 'Zero Coffee',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 215,
    tags: ['Authentic Matcha', 'Earthy', 'Smooth'],
    caffeine: 'Low',
  },
  {
    id: 'prod-7',
    name: 'Espresso Tonic Sparkler',
    category: 'Signature',
    note: 'Perpaduan double ristretto segar dengan sparkling tonic water dan perasan jeruk nipis lokal.',
    price: 23000,
    badge: 'Mood Booster',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 160,
    tags: ['Fizzy', 'Refreshing', 'Citrus'],
    caffeine: 'High',
  },
  {
    id: 'prod-8',
    name: 'French Butter Croissant',
    category: 'Pastry & Snack',
    note: 'Croissant renyah berlapis dengan butter Prancis murni, aroma gurih wangi, dipanggang tiap pagi.',
    price: 22000,
    badge: 'Fresh Daily',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 190,
    tags: ['Flaky', '100% French Butter'],
    caffeine: 'Non-Caffeine',
  },
  {
    id: 'prod-9',
    name: 'Sea Salt Dark Choco Cookie',
    category: 'Pastry & Snack',
    note: 'Soft-baked cookie dengan lelehan 70% dark chocolate dan taburan kristal garam laut gurih.',
    price: 16000,
    badge: 'Teman Ngopi',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 145,
    tags: ['Rich Choco', 'Soft Baked'],
    caffeine: 'Non-Caffeine',
  },
]

const CATEGORIES = ['Semua', 'Signature', 'Manual Brew', 'Non-Coffee', 'Pastry & Snack'] as const

const PHR_BUILDINGS = [
  'Gedung Rokan',
  'Gedung Lancang Kuning',
  'Main Office PHR',
  'Gedung Eksplorasi & Reservoir',
  'Central Workshop & Logistik',
  'Lainnya (Tulis di Catatan)',
]

export default function App() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Office Delivery Form State
  const [building, setBuilding] = useState(PHR_BUILDINGS[0])
  const [roomInfo, setRoomInfo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')

  // Order Tracking State
  const [trackingInput, setTrackingInput] = useState('')
  const [activeTracking, setActiveTracking] = useState<TrackingInfo | null>(null)

  // Item customization modal / drawer
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null)
  const [custSugar, setCustSugar] = useState<'Normal' | 'Less Sugar' | 'No Sugar'>('Normal')
  const [custIce, setCustIce] = useState<'Normal Ice' | 'Less Ice' | 'Hot'>('Normal Ice')

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Notification helper
  const showToast = (message: string) => {
    setNotification(message)
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr))
    }, 3200)
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchQuery
    })
  }, [selectedCategory, searchQuery])

  // Total cart calculation
  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  const totalCartPrice = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cart])

  // Free delivery threshold: 3 cups
  const isFreeDelivery = totalCartCount >= 3

  // Add to cart
  const handleAddToCart = (product: Product, sugar = 'Normal' as any, ice = 'Normal Ice' as any) => {
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.sugar === sugar && item.ice === ice,
    )

    if (existingIndex > -1) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += 1
      setCart(newCart)
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${sugar}-${ice}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        sugar,
        ice,
        quantity: 1,
      }
      setCart([...cart, newItem])
    }
    showToast(`✅ ${product.name} dimasukkan ke pesanan tim!`)
    setCustomizingProduct(null)
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
    showToast('Item dihapus dari pesanan')
  }

  // Quick Direct WhatsApp order for single item
  const directOrderWhatsApp = (productName: string) => {
    const text = encodeURIComponent(
      `Halo WE'TU Kopi! ☕\nSaya ingin pesan langsung: *${productName}*\nMohon diantar ke area kantor PHR.\n(Bisa minta info menu & estimasi waktu?)`,
    )
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank')
  }

  // Send Entire Cart via WhatsApp
  const sendCartToWhatsApp = () => {
    if (cart.length === 0) return

    let orderList = cart
      .map((item) => {
        const customNote = item.price >= 20000 ? ` (${item.sugar}, ${item.ice})` : ''
        return `• ${item.quantity}x ${item.name}${customNote} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`
      })
      .join('\n')

    const ongkirText = isFreeDelivery ? 'GRATIS (Promo 3+ Cup Ruangan)' : 'Rp 5.000'
    const totalWithOngkir = isFreeDelivery ? totalCartPrice : totalCartPrice + 5000

    const message =
      `*PESANAN KOPI WE'TU - AREA PHR* ☕🏢\n\n` +
      `*Daftar Pesanan:*\n${orderList}\n\n` +
      `--------------------------------\n` +
      `*Subtotal:* Rp ${totalCartPrice.toLocaleString('id-ID')}\n` +
      `*Ongkir Ruangan:* ${ongkirText}\n` +
      `*TOTAL:* Rp ${totalWithOngkir.toLocaleString('id-ID')}\n` +
      `--------------------------------\n\n` +
      `*DETAIL PENGANTARAN:*\n` +
      `📍 Gedung: *${building}*\n` +
      `🚪 Lantai & Ruang: *${roomInfo || 'Belum diisi'}*\n` +
      `👤 Pemesan: *${customerName || 'Staff PHR'}*\n` +
      (customerNotes ? `📝 Catatan: ${customerNotes}\n` : '') +
      `\nMohon konfirmasi pesanan dan nomor rekening / QRIS pembayarannya ya. Terima kasih!`

    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(message)}`, '_blank')
  }

  // Handle Order Tracker
  const handleTrackOrder = (code?: string) => {
    const idToSearch = (code || trackingInput).trim().toUpperCase()
    if (!idToSearch) return

    if (idToSearch.includes('ROKAN') || idToSearch.includes('2601')) {
      setActiveTracking({
        id: idToSearch,
        gedung: 'Gedung Rokan',
        lantai: 'Lantai 3 - Dept. Reservoir Eng.',
        courierName: 'Ryan Kurnia (Barista Runner)',
        courierPhone: '0812-9988-7711',
        step: 3,
        eta: '± 4 Menit lagi',
        items: ['2x Aren Cloud Latte (Less Sugar)', '1x French Butter Croissant'],
      })
    } else if (idToSearch.includes('LANCANG') || idToSearch.includes('8840')) {
      setActiveTracking({
        id: idToSearch,
        gedung: 'Gedung Lancang Kuning',
        lantai: 'Lantai 2 - Finance & Budgeting',
        courierName: 'Dimas Aditya (Barista Runner)',
        courierPhone: '0813-4455-6677',
        step: 2,
        eta: '± 12 Menit lagi',
        items: ['3x Sea Salt Caramel Macchiato', '2x Sea Salt Choco Cookie'],
      })
    } else {
      setActiveTracking({
        id: idToSearch,
        gedung: 'Main Office PHR',
        lantai: 'Lantai Dasar - Ruang Rapat Mahakam',
        courierName: 'Ahmad Fauzi (Barista Runner)',
        courierPhone: '0811-2233-4455',
        step: 1,
        eta: '± 18 Menit lagi',
        items: ['1x Kopi Susu Wetu Klasik', '1x Uji Matcha Cloud'],
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0a09] text-[#faf5ee] selection:bg-[#e8a756] selection:text-black">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#1c1815] border border-[#e8a756]/40 text-[#faf5ee] px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-slide-down">
          <Icon name="sparkles" className="w-5 h-5 text-[#e8a756] shrink-0" />
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-[#2a1e16] via-[#1a1410] to-[#2a1e16] border-b border-[#e8a756]/15 py-2 px-4 text-center text-xs text-[#d6ccbf]">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold text-[#e8a756]">
            <Icon name="sparkles" className="w-3.5 h-3.5" /> Promo Spesial Ruang Kerja:
          </span>
          <span>Gratis ongkir antar ke ruangan untuk pemesanan minimal 3 cup!</span>
          <a
            href="#menu"
            className="underline hover:text-white font-medium ml-1 transition-colors"
          >
            Pesan sekarang →
          </a>
        </div>
      </div>

      {/* Floating Glass Navbar */}
      <header className="sticky top-0 z-40 bg-[#0c0a09]/85 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand */}
          <a href="#" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-[#e8a756] to-[#a46824] shadow-lg shadow-[#e8a756]/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <img
                src="/logo.png"
                alt="WE'TU Kopi Logo"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-[#e8a756] transition-colors">
                  WE'TU Kopi
                </span>
                <span className="text-[10px] bg-[#e8a756]/15 text-[#e8a756] border border-[#e8a756]/30 px-1.5 py-0.5 rounded font-bold uppercase">
                  PHR Hub
                </span>
              </div>
              <span className="text-xs text-[#a6998b] block font-medium">
                Freshly Brewed at Pertamina Hulu Rokan
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#d6ccbf]">
            <a href="#menu" className="hover:text-[#e8a756] transition-colors">
              Menu Kopi
            </a>
            <a href="#delivery" className="hover:text-[#e8a756] transition-colors">
              Jangkauan Gedung
            </a>
            <a href="#tracker" className="hover:text-[#e8a756] transition-colors">
              Lacak Pesanan
            </a>
            <a href="#testimoni" className="hover:text-[#e8a756] transition-colors">
              Review Staff
            </a>
            <a href="#faq" className="hover:text-[#e8a756] transition-colors">
              Tanya Jawab
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Live Operational Status */}
            <div className="hidden lg:flex items-center gap-2 bg-[#171412] border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-[#d6ccbf]">
              <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse"></span>
              <span>Buka · 07:30–15:00 WIB</span>
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#1c1815] hover:bg-[#25201c] border border-[#e8a756]/30 hover:border-[#e8a756] text-[#faf5ee] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm group"
            >
              <Icon name="bag" className="w-4 h-4 text-[#e8a756] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Pesanan Kantor</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#e8a756] text-black font-bold text-xs flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp CTA */}
            <button
              onClick={() => directOrderWhatsApp('Menu Pilihan')}
              className="flex items-center gap-2 bg-[#25d366] hover:bg-[#20ba59] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#25d366]/20"
            >
              <Icon name="message" className="w-4 h-4 fill-black" />
              <span className="hidden sm:inline">Pesan WA</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#e8a756]/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-[#c88339]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 bg-[#1f1a16] border border-[#e8a756]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#e8a756] shadow-inner">
                <img src="/logo.png" alt="WE'TU" className="w-4 h-4 rounded-full bg-white object-cover" />
                Layanan Antar Khusus Komplek PHR Riau
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                Kopi Berkualitas WE'TU, Tiba Segar Langsung di{' '}
                <span className="gold-gradient-text block sm:inline">
                  Meja Kerjamu.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#a6998b] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Tak perlu panas-panasan keluar gedung atau antre berlama-lama.
                Pesan kopi racikan barista kami lewat WhatsApp, kurir runner WE'TU
                mengantar langsung sampai ke lantai dan ruangan kerja Anda.
              </p>

              {/* CTA Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 gold-gradient-bg text-black font-extrabold px-7 py-4 rounded-xl text-base shadow-xl shadow-[#e8a756]/20 hover:opacity-95 transition-all group"
                >
                  <Icon name="coffee" className="w-5 h-5" />
                  <span>Lihat Pilihan Menu</span>
                  <Icon name="arrowRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#tracker"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#171412] hover:bg-[#201c18] border border-white/10 hover:border-[#e8a756]/40 text-[#faf5ee] px-6 py-4 rounded-xl text-base font-semibold transition-all"
                >
                  <Icon name="bike" className="w-5 h-5 text-[#e8a756]" />
                  <span>Lacak Pesanan Berjalan</span>
                </a>
              </div>

              {/* Key Value Highlights */}
              <div className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#e8a756] font-bold text-sm">
                    <Icon name="clock" className="w-4 h-4" />
                    <span>15–25 Menit</span>
                  </div>
                  <p className="text-xs text-[#a6998b]">
                    Estimasi tiba sampai di ruangan kerja Anda.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#e8a756] font-bold text-sm">
                    <Icon name="building" className="w-4 h-4" />
                    <span>Semua Gedung</span>
                  </div>
                  <p className="text-xs text-[#a6998b]">
                    Rokan, Lancang, Main Office & sekitarnya.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#e8a756] font-bold text-sm">
                    <Icon name="star" className="w-4 h-4 fill-[#e8a756]" />
                    <span>4.9 / 5.0</span>
                  </div>
                  <p className="text-xs text-[#a6998b]">
                    Pilihan 2.000+ pekerja & staf PHR.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative">
              {/* Product Showcase Card */}
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-[#e8a756]/25 bg-gradient-to-b from-[#1f1a16] to-[#120f0d] p-3 shadow-2xl">
                {/* Main Image Frame */}
                <div className="relative h-96 sm:h-[420px] rounded-2xl overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1000&q=85"
                    alt="Aren Cloud Latte Signature Wetu Kopi"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>

                  {/* Top Tag */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/20 text-[#e8a756] px-3 py-1.5 rounded-full text-xs font-bold">
                    <img src="/logo.png" alt="WE'TU" className="w-4 h-4 rounded-full bg-white object-cover" />
                    <span>Signature WE'TU Hari Ini</span>
                  </div>

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#14110f]/90 backdrop-blur-md border border-[#e8a756]/30 p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#e8a756] font-bold block">
                          Menu Paling Dicari
                        </span>
                        <h4 className="text-lg font-extrabold text-white">
                          Aren Cloud Latte
                        </h4>
                        <p className="text-xs text-[#a6998b] mt-0.5 line-clamp-1">
                          Gula aren murni, creamy milk, double shot espresso
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-[#a6998b] block">Harga</span>
                        <span className="text-base font-extrabold text-[#e8a756]">
                          Rp 22.000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 1 - Delivery */}
                <div className="absolute -left-4 top-16 bg-[#1a1512]/95 border border-[#e8a756]/40 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md animate-float">
                  <div className="w-10 h-10 rounded-xl bg-[#e8a756]/15 text-[#e8a756] flex items-center justify-center">
                    <Icon name="bike" className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Gratis Antar Ruangan
                    </span>
                    <span className="text-[11px] text-[#a6998b]">
                      Min. 3 cup satu divisi
                    </span>
                  </div>
                </div>

                {/* Floating Badge 2 - Courier Speed */}
                <div className="absolute -right-4 bottom-24 bg-[#1a1512]/95 border border-[#25d366]/40 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md animate-float-delayed">
                  <div className="w-10 h-10 rounded-xl bg-[#25d366]/15 text-[#25d366] flex items-center justify-center">
                    <Icon name="clock" className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Termos Khusus Es
                    </span>
                    <span className="text-[11px] text-[#25d366]">
                      Es tetap utuh & dingin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ORDER TRACKER SECTION */}
      <section
        id="tracker"
        className="py-12 bg-gradient-to-b from-[#120f0d] via-[#171310] to-[#0c0a09] border-y border-white/[0.06]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#e8a756]/25 shadow-2xl relative overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#e8a756] uppercase tracking-wider mb-1">
                  <Icon name="bike" className="w-4 h-4" /> Live Tracking Pesanan PHR
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Lacak Posisi Kopi Kamu Sekarang
                </h3>
                <p className="text-sm text-[#a6998b]">
                  Masukkan ID Pesanan dari konfirmasi WhatsApp untuk memantau kurir secara real-time.
                </p>
              </div>

              {/* Quick Preset Buttons for testing */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#a6998b] font-medium mr-1">
                  Contoh Cepat:
                </span>
                <button
                  onClick={() => {
                    setTrackingInput('WTU-2601')
                    handleTrackOrder('WTU-2601')
                  }}
                  className="text-xs bg-[#251f1a] hover:bg-[#e8a756] hover:text-black text-[#e8a756] border border-[#e8a756]/30 px-2.5 py-1.5 rounded-lg transition-colors font-mono font-bold"
                >
                  WTU-2601 (Rokan)
                </button>
                <button
                  onClick={() => {
                    setTrackingInput('WTU-8840')
                    handleTrackOrder('WTU-8840')
                  }}
                  className="text-xs bg-[#251f1a] hover:bg-[#e8a756] hover:text-black text-[#e8a756] border border-[#e8a756]/30 px-2.5 py-1.5 rounded-lg transition-colors font-mono font-bold"
                >
                  WTU-8840 (Lancang)
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Icon name="search" className="w-5 h-5 text-[#a6998b] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Masukkan ID Pesanan, contoh: WTU-2601..."
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                  className="w-full bg-[#0c0a09] border border-white/15 focus:border-[#e8a756] rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-[#685d53] focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={() => handleTrackOrder()}
                className="gold-gradient-bg text-black font-bold px-7 py-3.5 rounded-xl text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#e8a756]/15 shrink-0"
              >
                <span>Lacak Pesanan</span>
                <Icon name="arrowRight" className="w-4 h-4" />
              </button>
            </div>

            {/* Live Result Card (Simulated) */}
            {activeTracking && (
              <div className="mt-8 bg-[#0c0a09]/90 border border-[#e8a756]/30 rounded-2xl p-6 animate-slide-down">
                {/* Result Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#e8a756] tracking-wider uppercase">
                        ID: #{activeTracking.id}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-[#25d366]/15 text-[#25d366] text-xs font-semibold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-pulse"></span>
                        {activeTracking.step === 3
                          ? 'Kurir Sedang Mengantar'
                          : activeTracking.step === 2
                          ? 'Sedang Diracik Barista'
                          : 'Pesanan Diterima'}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-white">
                      Tujuan: {activeTracking.gedung} ({activeTracking.lantai})
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-[#a6998b] block">
                        Estimasi Tiba
                      </span>
                      <span className="text-lg font-extrabold text-[#e8a756]">
                        {activeTracking.eta}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stepper Progress */}
                <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-6 relative">
                  {[
                    { label: 'Pesanan Diterima', time: '08:40 WIB', icon: 'checkCircle' as IconName, stepNum: 1 },
                    { label: 'Sedang Diracik', time: '08:48 WIB', icon: 'coffee' as IconName, stepNum: 2 },
                    { label: 'Kurir OTW Ruangan', time: 'Sekarang', icon: 'bike' as IconName, stepNum: 3 },
                    { label: 'Tiba di Meja', time: activeTracking.eta, icon: 'mapPin' as IconName, stepNum: 4 },
                  ].map((s, idx) => {
                    const isDone = s.stepNum <= activeTracking.step
                    const isCurrent = s.stepNum === activeTracking.step
                    return (
                      <div key={idx} className="relative flex flex-col items-center text-center">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                            isDone
                              ? 'bg-[#e8a756] text-black shadow-lg shadow-[#e8a756]/30'
                              : 'bg-[#1e1916] text-[#6b5e52] border border-white/5'
                          } ${isCurrent ? 'ring-4 ring-[#e8a756]/30' : ''}`}
                        >
                          <Icon name={s.icon} className="w-6 h-6" />
                        </div>
                        <span
                          className={`text-xs font-bold block ${
                            isDone ? 'text-white' : 'text-[#6b5e52]'
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="text-[11px] text-[#a6998b] mt-0.5">
                          {s.time}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Courier info card */}
                <div className="bg-[#181411] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-[#2a221b] border border-[#e8a756]/30 flex items-center justify-center text-[#e8a756] font-bold text-sm">
                      {activeTracking.courierName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs text-[#a6998b] block">Kurir Pengantar Ruangan</span>
                      <span className="text-sm font-bold text-white">
                        {activeTracking.courierName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() =>
                        directOrderWhatsApp(
                          `Update pesanan #${activeTracking.id} untuk ${activeTracking.gedung}`,
                        )
                      }
                      className="inline-flex items-center gap-2 bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#25d366] border border-[#25d366]/30 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Icon name="message" className="w-4 h-4" /> Hubungi Kurir (WA)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MENU SECTION */}
      <section id="menu" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#e8a756] uppercase tracking-wider block">
              Pilihan Racikan Barista
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Menu Kopi & Cemilan Hari Ini
            </h2>
            <p className="text-sm text-[#a6998b] max-w-xl">
              Diracik segar tiap pesanan masuk. Bisa request tingkat gula (Normal / Less / No Sugar) dan pilihan suhu.
            </p>
          </div>

          {/* Search bar inside menu */}
          <div className="relative w-full md:w-72">
            <Icon name="search" className="w-4 h-4 text-[#a6998b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kopi, caramel, v60..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171412] border border-white/10 focus:border-[#e8a756] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#786b5e] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a6998b] hover:text-white"
              >
                <Icon name="x" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'Semua'
                ? PRODUCTS.length
                : PRODUCTS.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === cat
                    ? 'bg-[#e8a756] text-black shadow-lg shadow-[#e8a756]/20'
                    : 'bg-[#171412] text-[#a6998b] hover:text-white hover:bg-[#201c18] border border-white/5'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    selectedCategory === cat
                      ? 'bg-black/20 text-black'
                      : 'bg-white/10 text-[#a6998b]'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#14110f] rounded-2xl border border-white/5">
            <Icon name="coffee" className="w-12 h-12 text-[#a6998b] mx-auto mb-3 opacity-40" />
            <h4 className="text-base font-bold text-white">Menu tidak ditemukan</h4>
            <p className="text-xs text-[#a6998b] mt-1">
              Coba kata kunci lain atau pilih kategori "Semua".
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group"
              >
                {/* Image Frame */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14110f] via-transparent to-transparent"></div>

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[#e8a756] text-black text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md">
                      {product.badge}
                    </span>
                  )}

                  {/* Rating Pill */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Icon name="star" className="w-3.5 h-3.5 fill-[#e8a756] text-[#e8a756]" />
                    <span>{product.rating}</span>
                  </div>

                  {/* Caffeine indicator */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] bg-black/70 backdrop-blur-md text-[#d6ccbf] px-2 py-0.5 rounded-md font-medium border border-white/10">
                      {product.caffeine} Caffeine
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#e8a756]">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#e8a756] transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-xs text-[#a6998b] leading-relaxed line-clamp-2">
                      {product.note}
                    </p>

                    {/* Flavour tags */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {product.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-[#221c17] text-[#c7baa8] px-2 py-0.5 rounded font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Price & Actions */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-[#a6998b] block font-medium">
                        Harga Satuan
                      </span>
                      <span className="text-lg font-extrabold text-white">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Direct WA button */}
                      <button
                        onClick={() => directOrderWhatsApp(product.name)}
                        title="Pesan langsung lewat WhatsApp"
                        className="w-10 h-10 rounded-xl bg-[#1f1a16] hover:bg-[#25d366]/20 border border-white/10 hover:border-[#25d366]/40 text-[#25d366] flex items-center justify-center transition-colors"
                      >
                        <Icon name="message" className="w-4 h-4" />
                      </button>

                      {/* Add to Team Cart */}
                      <button
                        onClick={() => {
                          setCustomizingProduct(product)
                        }}
                        className="gold-gradient-bg text-black font-extrabold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:opacity-95 transition-all shadow-md shadow-[#e8a756]/15"
                      >
                        <Icon name="plus" className="w-4 h-4 stroke-[3]" />
                        <span>Pesan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Office Bulk / Meeting Catering Box Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#201711] via-[#2c2018] to-[#1a130f] border border-[#e8a756]/30 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#e8a756]/15 text-[#e8a756] border border-[#e8a756]/30 px-3 py-1 rounded-full text-xs font-bold">
                <Icon name="sparkles" className="w-3.5 h-3.5" /> Paket Meeting & Rapat Divisi PHR
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Butuh Kopi untuk Rapat Kantor atau Event?
              </h3>
              <p className="text-sm text-[#d6ccbf] leading-relaxed max-w-2xl">
                Tersedia paket <strong>Meeting Box (5 atau 10 cup)</strong> dan{' '}
                <strong>Coffee Dispenser 5 Liter</strong> (sudah termasuk cup, sedotan ramah lingkungan, gula sachet, & creamer). Kurir kami siap mengantar tepat waktu sebelum meeting dimulai.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#e8a756]">
                <span>✓ Invoice & Kwitansi Resmi</span>
                <span>✓ Bisa bayar transfer / invoice kantor</span>
                <span>✓ Bebas mix varian rasa</span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <button
                onClick={() =>
                  directOrderWhatsApp(
                    'Paket Meeting Box Kopi Wetu untuk Rapat Divisi Kantor',
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25d366] hover:bg-[#20ba59] text-black font-extrabold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#25d366]/20"
              >
                <Icon name="message" className="w-5 h-5 fill-black" />
                <span>Pesan Paket Rapat (WA)</span>
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#171412] hover:bg-[#221c17] text-white font-semibold px-6 py-3.5 rounded-xl text-sm border border-white/10 transition-colors"
              >
                <Icon name="bag" className="w-4 h-4 text-[#e8a756]" />
                <span>Buka Keranjang Tim</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERY AREA & HOW IT WORKS */}
      <section
        id="delivery"
        className="py-20 bg-[#100d0b] border-t border-white/[0.06] relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-[#e8a756] uppercase tracking-wider block">
              Pengantaran Khusus Komplek Kantor PHR
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Cara Mudah Kopi Tiba di Ruangan Anda
            </h2>
            <p className="text-sm text-[#a6998b]">
              Tanpa repot, tim kurir runner WE'TU Kopi memiliki akses gedung resmi untuk mengantar sampai ke lantai dan meja kerja Anda.
            </p>
          </div>

          {/* 3 Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Pilih Menu & Isi Ruangan',
                desc: 'Pilih kopi favorit Anda atau kumpulkan pesanan teman satu ruangan lewat website ini atau langsung WhatsApp.',
                icon: 'bag' as IconName,
              },
              {
                step: '02',
                title: 'Barista Meracik Segar',
                desc: 'Biji kopi pilihan digiling dan diekstraksi saat pesanan masuk. Dikemas rapi anti-tumpah dengan termos es.',
                icon: 'coffee' as IconName,
              },
              {
                step: '03',
                title: 'Kurir Meluncur ke Ruangan',
                desc: 'Dalam 15-25 menit, kurir kami naik ke lantai tujuan dan menyerahkan kopi langsung ke tangan Anda.',
                icon: 'bike' as IconName,
              },
            ].map((st, i) => (
              <div
                key={i}
                className="bg-[#171412] border border-white/10 rounded-2xl p-8 relative flex flex-col justify-between hover:border-[#e8a756]/30 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#e8a756]/10 text-[#e8a756] border border-[#e8a756]/20 flex items-center justify-center">
                      <Icon name={st.icon} className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-white/10">
                      {st.step}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{st.title}</h4>
                  <p className="text-sm text-[#a6998b] leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Building coverage chips */}
          <div className="mt-12 p-6 rounded-2xl bg-[#14110f] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8a756]/15 text-[#e8a756] flex items-center justify-center shrink-0">
                <Icon name="mapPin" className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#a6998b] block font-medium">
                  Area Gedung yang Sudah Terjangkau
                </span>
                <span className="text-sm font-bold text-white">
                  Gedung Rokan, Lancang Kuning, Main Office, & Workshop Duri
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'Semua Lantai',
                'Ruang Rapat & Auditorium',
                'Meja Resepsionis / Lobi',
                'Mess & Lapangan',
              ].map((chip) => (
                <span
                  key={chip}
                  className="text-xs bg-[#1f1a16] text-[#d6ccbf] border border-white/10 px-3 py-1.5 rounded-lg"
                >
                  ✓ {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS & SOCIAL PROOF */}
      <section
        id="testimoni"
        className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold text-[#e8a756] uppercase tracking-wider block">
            Suara Pelanggan Setia
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Dipercaya Pekerja & Divisi PHR
          </h2>
          <p className="text-sm text-[#a6998b]">
            Dengarkan apa kata rekan-rekan kerja yang rutin memesan Wetu Kopi setiap hari.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Dimas Prasetyo',
              role: 'Reservoir Engineer · Gedung Rokan Lt. 3',
              comment:
                'Penyelamat pas sprint meeting jam 9 pagi! Kopinya beneran bold dan foam Aren Cloud Latte-nya creamy banget. Yang paling keren, kurir hafal ruangan jadi ga ribet telepon berkali-kali.',
              rating: 5,
              fav: 'Aren Cloud Latte',
            },
            {
              name: 'Sarah Nabila',
              role: 'HR Business Partner · Lancang Kuning Lt. 2',
              comment:
                'Sering pesan bareng tim 4–5 cup sekaligus biar dapet gratis ongkir. Sea Salt Caramel Macchiato-nya the best di Duri, manisnya seimbang dan ada gurih asinnya.',
              rating: 5,
              fav: 'Sea Salt Caramel',
            },
            {
              name: 'Budi Santoso',
              role: 'Logistik & Drilling Ops · Main Office PHR',
              comment:
                'Pengantaran selalu tepat waktu dan es batunya masih utuh dalam termos khusus kurir. Buat yang ga minum kopi, Matcha Cloud-nya juga sangat enak dan pekat!',
              rating: 5,
              fav: 'Uji Matcha Cloud',
            },
          ].map((rev, i) => (
            <div
              key={i}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4 border border-white/10"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#e8a756]">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Icon key={idx} name="star" className="w-4 h-4 fill-[#e8a756]" />
                  ))}
                </div>
                <p className="text-sm text-[#d6ccbf] leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-white">{rev.name}</h5>
                  <p className="text-xs text-[#a6998b]">{rev.role}</p>
                </div>
                <span className="text-[10px] bg-[#221c17] text-[#e8a756] border border-[#e8a756]/20 px-2 py-1 rounded">
                  Fav: {rev.fav}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section
        id="faq"
        className="py-16 bg-[#100d0b] border-t border-white/[0.06]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-[#e8a756] uppercase tracking-wider block">
              Pertanyaan Umum
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Sering Ditanyakan (FAQ)
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Berapa lama estimasi pengantaran ke ruangan saya?',
                a: 'Rata-rata 15 sampai 25 menit tergantung lokasi gedung dan antrean racik barista. Untuk jam sibuk (08.00–09.30 WIB), kami sarankan memesan 30 menit sebelum jam meeting dimulai.',
              },
              {
                q: 'Bagaimana syarat mendapatkan GRATIS Ongkir Pengantaran?',
                a: 'Cukup memesan minimal 3 cup kopi/minuman dalam satu alamat ruangan/lantai gedung yang sama. Kurir runner kami akan mengantar langsung tanpa biaya ongkir tambahan.',
              },
              {
                q: 'Apakah bisa request tingkat kemanisan (less sugar) atau susu oat?',
                a: 'Tentu bisa! Saat memesan lewat website atau WhatsApp, Anda bebas memilih opsi Normal Sugar (100%), Less Sugar (50%), atau No Sugar (0%), serta request es normal, sedikit es, atau versi panas (hot).',
              },
              {
                q: 'Metode pembayaran apa saja yang diterima?',
                a: 'Kami menerima QRIS (BCA, Mandiri, BRI, GoPay, OVO, ShopeePay), Transfer Bank, serta Tunai (Cash) saat kurir tiba di ruangan. Untuk kebutuhan kantor/rapat, kami juga menyediakan nota/kwitansi resmi.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#171412] border border-white/10 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-[#e8a756] transition-colors"
                >
                  <span>{faq.q}</span>
                  <Icon
                    name="chevronDown"
                    className={`w-4 h-4 text-[#e8a756] shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#a6998b] leading-relaxed border-t border-white/5 pt-3 animate-slide-down">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#090706] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-[#e8a756] to-[#a46824] shadow-lg shadow-[#e8a756]/20 flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="WE'TU Kopi Logo"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div>
                  <span className="font-extrabold text-xl text-white block">
                    WE'TU Kopi
                  </span>
                  <span className="text-xs text-[#a6998b]">
                    Teman Ngopi di Hari Produktif Anda
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#a6998b] leading-relaxed max-w-md">
                Menyajikan kopi kualitas kafe specialty langsung ke meja kerja Anda di area komplek perkantoran Pertamina Hulu Rokan. Praktis, cepat, dan segar setiap saat.
              </p>
              <div className="flex items-center gap-3 text-xs text-[#d6ccbf]">
                <span className="inline-flex items-center gap-1.5 bg-[#25d366]/15 text-[#25d366] px-2.5 py-1 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25d366]"></span>
                  Senin – Jumat: 07:30 – 15:00 WIB
                </span>
              </div>
            </div>

            {/* Col 2: Navigasi */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                Navigasi Cepat
              </h5>
              <ul className="space-y-2 text-xs text-[#a6998b]">
                <li>
                  <a href="#menu" className="hover:text-[#e8a756] transition-colors">
                    Menu & Harga
                  </a>
                </li>
                <li>
                  <a href="#tracker" className="hover:text-[#e8a756] transition-colors">
                    Lacak Pesanan
                  </a>
                </li>
                <li>
                  <a href="#delivery" className="hover:text-[#e8a756] transition-colors">
                    Jangkauan Gedung
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#e8a756] transition-colors">
                    Tanya Jawab (FAQ)
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Hubungi kami */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                Kontak & Pemesanan
              </h5>
              <div className="space-y-2 text-xs text-[#a6998b]">
                <p className="flex items-center gap-2">
                  <Icon name="message" className="w-4 h-4 text-[#25d366]" />
                  <span>WhatsApp Barista: +62 812-3456-7890</span>
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="mapPin" className="w-4 h-4 text-[#e8a756]" />
                  <span>Komplek Pertamina Hulu Rokan, Riau</span>
                </p>
                <p className="text-[11px] text-[#6b5e52] pt-2">
                  *Untuk kerjasama catering & event kantor, hubungi admin via WA.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b5e52]">
            <p>© {new Date().getFullYear()} WE'TU Kopi. Hak Cipta Dilindungi.</p>
            <p>Didesain dengan ❤️ untuk seluruh pejuang produktif PHR.</p>
          </div>
        </div>
      </footer>

      {/* CUSTOMIZE PRODUCT MODAL */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-slide-down">
          <div className="bg-[#171412] border border-[#e8a756]/30 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setCustomizingProduct(null)}
              className="absolute top-4 right-4 text-[#a6998b] hover:text-white p-2"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex gap-4 items-center">
              <img
                src={customizingProduct.image}
                alt={customizingProduct.name}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-white/10"
              />
              <div>
                <span className="text-[10px] text-[#e8a756] font-bold uppercase">
                  {customizingProduct.category}
                </span>
                <h4 className="text-lg font-bold text-white">
                  {customizingProduct.name}
                </h4>
                <span className="text-sm font-extrabold text-[#e8a756]">
                  Rp {customizingProduct.price.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Sugar Level Options */}
            {customizingProduct.price >= 20000 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-white block">
                  Tingkat Kemanisan (Sugar Level):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Normal', 'Less Sugar', 'No Sugar'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setCustSugar(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        custSugar === s
                          ? 'bg-[#e8a756] text-black shadow-md'
                          : 'bg-[#221c17] text-[#a6998b] border border-white/5 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ice / Temperature Options */}
            {customizingProduct.price >= 20000 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-white block">
                  Suhu Minuman:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Normal Ice', 'Less Ice', 'Hot'] as const).map((i) => (
                    <button
                      key={i}
                      onClick={() => setCustIce(i)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        custIce === i
                          ? 'bg-[#e8a756] text-black shadow-md'
                          : 'bg-[#221c17] text-[#a6998b] border border-white/5 hover:text-white'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setCustomizingProduct(null)}
                className="w-1/3 py-3 rounded-xl text-xs font-bold bg-[#221c17] text-[#a6998b] hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddToCart(customizingProduct, custSugar, custIce)}
                className="flex-1 gold-gradient-bg text-black font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-[#e8a756]/20 flex items-center justify-center gap-2"
              >
                <Icon name="plus" className="w-4 h-4 stroke-[3]" />
                <span>Tambahkan ke Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEAM CART & OFFICE DELIVERY DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-slide-down">
          <div className="w-full max-w-lg bg-[#14110f] border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#191512]">
              <div className="flex items-center gap-2.5">
                <Icon name="bag" className="w-5 h-5 text-[#e8a756]" />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Pesanan Kantor Tim Anda
                  </h3>
                  <span className="text-xs text-[#a6998b]">
                    {totalCartCount} Item di dalam keranjang
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>

            {/* Free Delivery Meter */}
            <div className="bg-[#1e1814] px-6 py-3 border-b border-[#e8a756]/20">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className={isFreeDelivery ? 'text-[#25d366]' : 'text-[#e8a756]'}>
                  {isFreeDelivery
                    ? '🎉 Selamat! Gratis Ongkir Antar Ruangan Aktif'
                    : `Tambah ${3 - totalCartCount} cup lagi untuk GRATIS ongkir ruangan!`}
                </span>
                <span className="text-[#a6998b]">{totalCartCount}/3 Cup</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isFreeDelivery ? 'bg-[#25d366]' : 'bg-[#e8a756]'
                  }`}
                  style={{ width: `${Math.min((totalCartCount / 3) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 text-[#a6998b] flex items-center justify-center mx-auto">
                    <Icon name="bag" className="w-8 h-8 opacity-40" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Keranjang Pesanan Masih Kosong
                  </h4>
                  <p className="text-xs text-[#a6998b] max-w-xs mx-auto">
                    Pilih minuman atau makanan dari menu untuk memesan bersama rekan satu ruangan kerja Anda.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="gold-gradient-bg text-black font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5"
                  >
                    <span>Pilih Menu Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#1a1613] border border-white/5 rounded-2xl p-4 flex gap-4 items-center justify-between"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-white truncate">
                          {item.name}
                        </h5>
                        <p className="text-[11px] text-[#a6998b]">
                          {item.sugar} · {item.ice}
                        </p>
                        <span className="text-xs font-extrabold text-[#e8a756]">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-[#251f1a] border border-white/10 px-2 py-1 rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
                        >
                          <Icon name="minus" className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-[#e8a756] text-black flex items-center justify-center transition-colors"
                        >
                          <Icon name="plus" className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#8d7e70] hover:text-red-400 p-1 transition-colors"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery Destination Form */}
              {cart.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-[#e8a756] uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="mapPin" className="w-4 h-4" /> Lokasi Pengantaran Ruangan
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#a6998b] font-medium block mb-1">
                        Pilih Gedung Kantor di PHR:
                      </label>
                      <select
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        className="w-full bg-[#1a1613] border border-white/15 focus:border-[#e8a756] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                      >
                        {PHR_BUILDINGS.map((b) => (
                          <option key={b} value={b} className="bg-[#171412]">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-[#a6998b] font-medium block mb-1">
                        Lantai & Nomor Ruangan / Nama Divisi:
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Lantai 3, Ruang Tim Drilling 302..."
                        value={roomInfo}
                        onChange={(e) => setRoomInfo(e.target.value)}
                        className="w-full bg-[#1a1613] border border-white/15 focus:border-[#e8a756] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#685e54] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#a6998b] font-medium block mb-1">
                          Nama Pemesan:
                        </label>
                        <input
                          type="text"
                          placeholder="Nama Anda..."
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-[#1a1613] border border-white/15 focus:border-[#e8a756] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#685e54] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#a6998b] font-medium block mb-1">
                          Catatan (Opsional):
                        </label>
                        <input
                          type="text"
                          placeholder="Titip resepsionis / telpon dulu..."
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          className="w-full bg-[#1a1613] border border-white/15 focus:border-[#e8a756] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#685e54] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer with WA Action */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#171412] space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#a6998b]">
                    <span>Subtotal ({totalCartCount} item)</span>
                    <span>Rp {totalCartPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[#a6998b]">
                    <span>Ongkos Kirim Ruangan</span>
                    <span className={isFreeDelivery ? 'text-[#25d366] font-bold' : ''}>
                      {isFreeDelivery ? 'GRATIS' : 'Rp 5.000'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                    <span>Total Tagihan</span>
                    <span className="text-[#e8a756]">
                      Rp{' '}
                      {(isFreeDelivery
                        ? totalCartPrice
                        : totalCartPrice + 5000
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={sendCartToWhatsApp}
                  className="w-full bg-[#25d366] hover:bg-[#20ba59] text-black font-extrabold py-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#25d366]/20 transition-all"
                >
                  <Icon name="message" className="w-5 h-5 fill-black" />
                  <span>Kirim Pesanan Lengkap ke WhatsApp →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
