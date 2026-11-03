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
  const sendCartToWhatsApp = async () => {
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

    // --- INTEGRASI GOOGLE SHEETS ---
    try {
      const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxhVBE5I-qtleommkvR9149Du8iGqsncKCAkMibPILytM8uhQFhKUgVJremtsxMrhH6/exec';
      
      const payload = {
        customerName: customerName || 'Staff PHR',
        building: building,
        roomInfo: roomInfo || 'Tidak diisi',
        orderDetails: orderList,
        totalPrice: `Rp ${totalWithOngkir.toLocaleString('id-ID')}`,
        customerNotes: customerNotes || '-',
      };

      // Menggunakan mode 'no-cors' karena Google Apps Script melakukan redirect
      // Kita tidak bisa membaca respon JSON secara detail, tapi request tetap sampai ke server
      await fetch(SHEET_API_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      showToast('✅ Pesanan dicatat di sistem & mengirim ke WA...');
    } catch (error) {
      console.error('Gagal menyimpan ke Sheets:', error);
      showToast('⚠️ Pesanan terkirim ke WA, tapi gagal dicatat di sistem.');
    }
    // ------------------------------

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
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e8a756] text-[10px] font-bold text-black">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#0c0a09]">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#e8a756]/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#a46824]/10 blur-[120px]" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1c1815] border border-[#e8a756]/30 px-3 py-1 rounded-full text-xs font-bold text-[#e8a756] mb-6 animate-fade-in">
            <Icon name="sparkles" className="w-3 h-3" />
            <span>Specialty Coffee for PHR Professionals</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-tight animate-slide-up">
            Awali Hari <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8a756] to-[#fcd4a3]">
              Lebih Produktif
            </span>
          </h1>
          <p className="text-[#a6998b] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Nikmati racikan kopi kualitas premium yang diantar langsung ke meja kerja Anda di seluruh gedung Pertamina Hulu Rokan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <a
              href="#menu"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl gold-gradient-bg text-black font-extrabold text-lg shadow-xl shadow-[#e8a756]/20 hover:scale-105 transition-transform flex items-center justify-center gap-2 group"
            >
              <span>Pesan Sekarang</span>
              <Icon name="arrowRight" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#tracker"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#1c1815] text-white font-bold text-lg border border-white/10 hover:bg-[#25201c] transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="clock" className="w-5 h-5 text-[#e8a756]" />
              <span>Lacak Pesanan</span>
            </a>
          </div>
        </div>
      </section>

      {/* MENU SECTION */}
      <section id="menu" className="py-24 bg-[#0f0d0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Katalog <span className="text-[#e8a756]">Menu</span>
              </h2>
              <p className="text-[#a6998b] font-medium">
                Pilih teman kerja terbaikmu hari ini.
              </p>
            </div>
            
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5e52]" />
                <input
                  type="text"
                  placeholder="Cari kopi..."
                  className="bg-[#1c1815] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#6b5e52] focus:outline-none focus:border-[#e8a756] transition-colors w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#e8a756] text-black shadow-lg shadow-[#e8a756]/20'
                        : 'bg-[#1c1815] text-[#a6998b] border border-white/10 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-[#171412] border border-white/5 rounded-3xl overflow-hidden hover:border-[#e8a756]/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-2xl hover:shadow-[#e8a756]/10"
              >
                {/* Image Wrapper */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-[#e8a756] text-black text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                      {product.badge}
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white">
                    <Icon name="star" className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{product.rating}</span>
                    <span className="text-white/50 font-normal">({product.reviewsCount})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-[#e8a756] transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <span className="text-lg font-black text-white whitespace-nowrap">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm text-[#a6998b] line-clamp-2 leading-relaxed">
                    {product.note}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium bg-white/5 text-[#d6ccbf] px-2 py-0.5 rounded-md border border-white/5">
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] font-bold bg-[#e8a756]/10 text-[#e8a756] px-2 py-0.5 rounded-md border border-[#e8a756]/20">
                      {product.caffeine} Caffeine
                    </span>
                  </div>
                  <button
                    onClick={() => setCustomizingProduct(product)}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#e8a756] hover:text-black text-white font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn border border-white/10 hover:border-transparent"
                  >
                    <Icon name="plus" className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span>Tambah Pesanan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Icon name="search" className="w-10 h-10 text-[#6b5e52]" />
              </div>
              <h3 className="text-xl font-bold text-white">Menu tidak ditemukan</h3>
              <p className="text-[#a6998b]">Coba keyword lain atau ganti kategori.</p>
            </div>
          )}
        </div>
      </section>

      {/* DELIVERY INFO SECTION */}
      <section id="delivery" className="py-24 bg-[#0c0a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative z-10 bg-[#1c1815] border border-white/10 p-8 rounded-3xl shadow-2xl space-y-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8a756] flex items-center justify-center text-black">
                    <Icon name="bike" className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Sistem Antar Ruangan</h3>
                </div>
                <div className="space-y-4">
                  {PHR_BUILDINGS.map((b, i) => (
                    <div key={b} className="flex items-center gap-3 text-sm text-[#d6ccbf] group">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#e8a756] group-hover:bg-[#e8a756] group-hover:text-black transition-colors">
                        {i + 1}
                      </span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#e8a756]/10 border border-[#e8a756]/20 rounded-2xl">
                  <p className="text-xs text-[#e8a756] font-bold leading-relaxed">
                    ✨ Promo: Pesan minimal 3 cup untuk satu ruangan, kami antar GRATIS sampai meja Anda!
                  </p>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#e8a756]/10 blur-[100px] -z-10" />
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-black text-white leading-tight">
                Kopi Berkualitas, <br />
                <span className="text-[#e8a756]">Tanpa Perlu Beranjak</span>
              </h2>
              <p className="text-[#a6998b] text-lg leading-relaxed">
                Kami mengerti betapa berharganya waktu Anda di tengah deadline. Itulah kenapa WE'TU hadir untuk mengantar mood booster langsung ke meja kerja Anda di area PHR.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: 'sparkles', text: 'Barista Runner standby setiap jam kerja.' },
                  { icon: 'checkCircle', text: 'Pembayaran praktis via QRIS/Transfer.' },
                  { icon: 'clock', text: 'Estimasi antar cepat & tetap panas/dingin.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-medium">
                    <Icon name={item.icon as IconName} className="w-5 h-5 text-[#e8a756]" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKER SECTION */}
      <section id="tracker" className="py-24 bg-[#0f0d0b]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1c1815] border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-[#a6998b] mb-6">
            <Icon name="clock" className="w-3 h-3" />
            <span>Real-time Tracking</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            Di mana <span className="text-[#e8a756]">Kopi Anda?</span>
          </h2>
          
          <div className="relative max-w-md mx-auto mb-12">
            <input
              type="text"
              placeholder="Masukkan Kode Pesanan (Contoh: ROKAN-01)"
              className="w-full bg-[#1c1815] border border-white/10 rounded-2xl pl-6 pr-16 py-4 text-white placeholder-[#6b5e52] focus:outline-none focus:border-[#e8a756] transition-all shadow-2xl"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
            />
            <button
              onClick={() => handleTrackOrder()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl gold-gradient-bg text-black font-bold text-sm transition-transform active:scale-95"
            >
              Lacak
            </button>
          </div>

          {activeTracking && (
            <div className="bg-[#171412] border border-[#e8a756]/30 rounded-3xl p-8 text-left animate-slide-up shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] text-[#e8a756] font-bold uppercase tracking-widest">Status Pesanan</span>
                  <h3 className="text-2xl font-black text-white">{activeTracking.id}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#a6998b] font-bold uppercase block">Estimasi Tiba</span>
                  <span className="text-xl font-black text-[#e8a756]">{activeTracking.eta}</span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#e8a756]/20 flex items-center justify-center text-[#e8a756]">
                    <Icon name="building" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#a6998b] font-medium">Lokasi Antar</p>
                    <p className="text-sm font-bold text-white">{activeTracking.gedung}, {activeTracking.lantai}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#e8a756]/20 flex items-center justify-center text-[#e8a756]">
                    <Icon name="bike" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[#a6998b] font-medium">Kurir Barista</p>
                    <p className="text-sm font-bold text-white">{activeTracking.courierName} ({activeTracking.courierPhone})</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-[#a6998b] uppercase tracking-wider">Item Pesanan:</p>
                <div className="grid grid-cols-1 gap-2">
                  {activeTracking.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white font-medium">
                      <Icon name="checkCircle" className="w-4 h-4 text-[#25d366]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section id="testimoni" className="py-24 bg-[#0c0a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Kata <span className="text-[#e8a756]">Staff PHR</span></h2>
            <p className="text-[#a6998b]">Apa kata mereka tentang mood booster harian kami.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Andi Setiawan',
                role: 'Reservoir Engineer',
                text: 'Kopi Aren Cloud-nya juara! Sangat membantu buat melek pas lagi review data bor di siang hari. Pengiriman cepat banget.',
                rating: 5,
              },
              {
                name: 'Sari Rahayu',
                role: 'Finance Dept',
                text: 'Suka banget sama Japanese Cold Drip-nya, clean dan seger. Akhirnya gak perlu turun gedung cuma buat cari kopi enak.',
                rating: 5,
              },
              {
                name: 'Budi Hartono',
                role: 'IT Support',
                text: 'Pelayanannya ramah, barista runner-nya hafal jalan pintas antar gedung. Cocok buat pesen barengan satu tim.',
                rating: 4,
              },
            ].map((t, i) => (
              <div key={i} className="bg-[#171412] border border-white/5 p-8 rounded-3xl relative group hover:border-[#e8a756]/30 transition-all">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Icon
                      key={star}
                      name="star"
                      className={`w-4 h-4 ${star < t.rating ? 'fill-yellow-400' : 'text-white/20'}`}
                    />
                  ))}
                </div>
                <p className="text-[#d6ccbf] italic mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8a756] to-[#a46824] flex items-center justify-center font-bold text-black text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{t.name}</h4>
                    <p className="text-xs text-[#a6998b]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-[#0f0d0b]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Tanya <span className="text-[#e8a756]">Jawab</span></h2>
            <p className="text-[#a6998b]">Semua yang perlu Anda ketahui tentang WE'TU Kopi.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Bagaimana cara memesan untuk satu ruangan?',
                a: 'Anda bisa menggunakan fitur "Pesanan Kantor Tim" di menu keranjang. Tambahkan semua pesanan rekan kerja Anda, isi detail ruangan, dan kirim via WhatsApp.',
              },
              {
                q: 'Apakah benar ada promo gratis ongkir?',
                a: 'Benar! Untuk pemesanan minimal 3 cup dalam satu alamat ruangan, kami berikan gratis ongkir antar ruangan.',
              },
              {
                q: 'Metode pembayaran apa yang tersedia?',
                a: 'Kami menerima pembayaran via QRIS (All Payment), Transfer Bank, dan Tunai saat kopi tiba di meja Anda.',
              },
              {
                q: 'Kapan jam operasional WE\'TU Kopi?',
                a: 'Kami melayani pesanan dari Senin sampai Jumat, pukul 07:30 hingga 15:00 WIB.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  openFaq === i ? 'border-[#e8a756] bg-[#1c1815]' : 'border-white/10 bg-transparent'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className={`font-bold text-sm ${openFaq === i ? 'text-white' : 'text-[#d6ccbf]'}`}>
                    {faq.q}
                  </span>
                  <Icon
                    name="chevronDown"
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openFaq === i ? 'rotate-180 text-[#e8a756]' : 'text-[#6b5e52]'
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="p-5 pt-0 text-sm text-[#a6998b] leading-relaxed animate-slide-down">
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
                        placeholder="Cont contoh: Lantai 3, Ruang Tim Drilling 302..."
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
