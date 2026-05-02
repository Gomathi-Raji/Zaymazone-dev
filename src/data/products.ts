import silkScarf from "@/assets/silk-scarf.jpg";
import copperBottle from "@/assets/copper-bottle.jpg";
import incenseHolder from "@/assets/incense-holder.jpg";
import juteBag from "@/assets/jute-bag.jpg";
import jewelryBox from "@/assets/jewelry-box.jpg";
import teaSet from "@/assets/tea-set.jpg";
import terracottaVase from "@/assets/terracotta-vase.jpg";
import kashmiriShawl from "@/assets/kashmiri-shawl.jpg";
import woodenToys from "@/assets/wooden-toys.jpg";
import bluepotterySet from "@/assets/blue-pottery-set.jpg";
import cottonBedsheet from "@/assets/cotton-bedsheet.jpg";
import brassBowl from "@/assets/brass-bowl.jpg";
import madhubaniPainting from "@/assets/madhubani-painting.jpg";
import bandhaniDupatta from "@/assets/bandhani-dupatta.jpg";
import kanthaStole from "@/assets/kantha-stole.jpg";
import metalLamp from "@/assets/metal-lamp.jpg";
import kalamkariWall from "@/assets/kalamkari-wall.jpg";
import stoneCoasters from "@/assets/stone-coasters.jpg";
import dhokraElephant from "@/assets/dhokra-elephant.jpg";
import ikatSaree from "@/assets/ikat-saree.jpg";

// Artisan avatars
import artisanAvatar1 from "@/assets/artisan-avatar-1.jpg";
import artisanAvatar2 from "@/assets/artisan-avatar-2.jpg";
import artisanAvatar3 from "@/assets/artisan-avatar-3.jpg";
import artisanAvatar4 from "@/assets/artisan-avatar-4.jpg";
import artisanAvatar5 from "@/assets/artisan-avatar-5.jpg";
import artisanAvatar6 from "@/assets/artisan-avatar-6.jpg";
import artisanAvatar7 from "@/assets/artisan-avatar-7.jpg";
import artisanAvatar8 from "@/assets/artisan-avatar-8.jpg";
import artisanAvatar9 from "@/assets/artisan-avatar-9.jpg";
import artisanAvatar10 from "@/assets/artisan-avatar-10.jpg";
import artisanAvatar11 from "@/assets/artisan-avatar-11.jpg";
import artisanAvatar12 from "@/assets/artisan-avatar-12.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  materials: string[];
  dimensions: string;
  weight: string;
  colors: string[];
  inStock: boolean;
  stockCount: number;
  artisan: {
    id: string;
    name: string;
    location: string;
    bio: string;
    avatar: string;
    rating: number;
    totalProducts: number;
  };
  rating: number;
  reviewCount: number;
  tags: string[];
  isHandmade: boolean;
  shippingTime: string;
  featured: boolean;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Handcrafted Terracotta Vase",
    description: "Beautiful traditional terracotta vase with intricate patterns, perfect for home decoration. Made using ancient pottery techniques passed down through generations.",
    price: 1299,
    originalPrice: 1599,
    images: [terracottaVase, terracottaVase, terracottaVase],
    category: "pottery",
    subcategory: "vases",
    materials: ["Terracotta", "Natural Clay"],
    dimensions: "15cm x 15cm x 20cm",
    weight: "800g",
    colors: ["Terracotta", "Brown"],
    inStock: true,
    stockCount: 12,
    artisan: {
      id: "artisan-1",
      name: "Rajesh Kumar",
      location: "Khurja, Uttar Pradesh",
      bio: "Master potter with 25+ years of experience in traditional Indian pottery",
      avatar: artisanAvatar1,
      rating: 4.8,
      totalProducts: 24
    },
    rating: 4.6,
    reviewCount: 18,
    tags: ["traditional", "handmade", "eco-friendly"],
    isHandmade: true,
    shippingTime: "3-5 days",
    featured: true
  },
  {
    id: "2",
    name: "Kashmiri Pashmina Shawl",
    description: "Authentic hand-woven Kashmiri pashmina shawl with traditional embroidery. Soft, warm, and luxurious.",
    price: 4999,
    originalPrice: 6999,
    images: [kashmiriShawl, kashmiriShawl],
    category: "textiles",
    subcategory: "shawls",
    materials: ["Pure Pashmina", "Silk Thread"],
    dimensions: "200cm x 70cm",
    weight: "150g",
    colors: ["Burgundy", "Gold"],
    inStock: true,
    stockCount: 5,
    artisan: {
      id: "artisan-2",
      name: "Fatima Sheikh",
      location: "Srinagar, Kashmir",
      bio: "Third-generation pashmina weaver specializing in traditional Kashmiri patterns",
      avatar: artisanAvatar2,
      rating: 4.9,
      totalProducts: 15
    },
    rating: 4.8,
    reviewCount: 32,
    tags: ["luxury", "handwoven", "kashmiri"],
    isHandmade: true,
    shippingTime: "5-7 days",
    featured: true
  },
  {
    id: "3",
    name: "Wooden Educational Toy Set",
    description: "Set of 12 handcrafted wooden toys designed to enhance children's learning and creativity. Made from sustainable wood.",
    price: 899,
    images: [woodenToys, woodenToys],
    category: "crafts",
    subcategory: "toys",
    materials: ["Sustainable Wood", "Natural Paint"],
    dimensions: "25cm x 20cm x 5cm",
    weight: "400g",
    colors: ["Natural Wood", "Multi-color"],
    inStock: true,
    stockCount: 20,
    artisan: {
      id: "artisan-3",
      name: "Suresh Chandel",
      location: "Channapatna, Karnataka",
      bio: "Specialist in Channapatna wooden toys, continuing family tradition of 40+ years",
      avatar: artisanAvatar3,
      rating: 4.7,
      totalProducts: 31
    },
    rating: 4.5,
    reviewCount: 24,
    tags: ["educational", "eco-friendly", "children"],
    isHandmade: true,
    shippingTime: "2-4 days",
    featured: false
  },
  {
    id: "4",
    name: "Blue Pottery Dinner Set",
    description: "Complete dinner set featuring traditional Jaipur blue pottery. Includes 6 plates, 6 bowls, and serving dishes.",
    price: 2799,
    originalPrice: 3499,
    images: [bluepotterySet, bluepotterySet],
    category: "pottery",
    subcategory: "dinnerware",
    materials: ["Ceramic", "Natural Dyes"],
    dimensions: "Set of 18 pieces",
    weight: "3.5kg",
    colors: ["Blue", "White"],
    inStock: true,
    stockCount: 8,
    artisan: {
      id: "artisan-4",
      name: "Mohan Lal",
      location: "Jaipur, Rajasthan",
      bio: "Master of Jaipur blue pottery with expertise in traditional glazing techniques",
      avatar: artisanAvatar4,
      rating: 4.6,
      totalProducts: 19
    },
    rating: 4.4,
    reviewCount: 15,
    tags: ["dinnerware", "traditional", "ceramic"],
    isHandmade: true,
    shippingTime: "4-6 days",
    featured: false
  },
  {
    id: "5",
    name: "Handloom Cotton Bedsheet Set",
    description: "Pure cotton bedsheet set with traditional block prints. Includes 1 bedsheet and 2 pillow covers.",
    price: 1899,
    images: [cottonBedsheet, cottonBedsheet],
    category: "textiles",
    subcategory: "bedding",
    materials: ["Pure Cotton", "Natural Dyes"],
    dimensions: "Double bed (220cm x 240cm)",
    weight: "800g",
    colors: ["Indigo", "White"],
    inStock: true,
    stockCount: 15,
    artisan: {
      id: "artisan-5",
      name: "Kamala Devi",
      location: "Sanganer, Rajasthan",
      bio: "Expert in traditional block printing with 20+ years of experience",
      avatar: artisanAvatar5,
      rating: 4.5,
      totalProducts: 22
    },
    rating: 4.3,
    reviewCount: 28,
    tags: ["bedding", "block-print", "cotton"],
    isHandmade: true,
    shippingTime: "3-5 days",
    featured: false
  },
  {
    id: "6",
    name: "Brass Decorative Bowl",
    description: "Intricately designed brass bowl with traditional engravings. Perfect for home decoration or serving.",
    price: 749,
    images: [brassBowl, brassBowl],
    category: "crafts",
    subcategory: "home-decor",
    materials: ["Pure Brass"],
    dimensions: "20cm diameter x 8cm height",
    weight: "600g",
    colors: ["Golden Brass"],
    inStock: true,
    stockCount: 25,
    artisan: {
      id: "artisan-6",
      name: "Vikram Singh",
      location: "Moradabad, Uttar Pradesh",
      bio: "Third-generation brass craftsman specializing in traditional metalwork",
      avatar: artisanAvatar6,
      rating: 4.7,
      totalProducts: 28
    },
    rating: 4.6,
    reviewCount: 12,
    tags: ["brass", "decorative", "traditional"],
    isHandmade: true,
    shippingTime: "2-4 days",
    featured: true
  },
  {
    id: "7",
    name: "Silk Paisley Scarf",
    description: "Luxurious handwoven silk scarf with intricate paisley patterns. Made with premium silk threads and traditional weaving techniques.",
    price: 2499,
    originalPrice: 3299,
    images: [silkScarf, silkScarf],
    category: "textiles",
    subcategory: "scarves",
    materials: ["Pure Silk", "Natural Dyes"],
    dimensions: "180cm x 60cm",
    weight: "120g",
    colors: ["Emerald Green", "Gold"],
    inStock: true,
    stockCount: 10,
    artisan: {
      id: "artisan-7",
      name: "Meera Sharma",
      location: "Varanasi, Uttar Pradesh",
      bio: "Expert silk weaver with expertise in traditional Banarasi patterns",
      avatar: artisanAvatar7,
      rating: 4.9,
      totalProducts: 18
    },
    rating: 4.7,
    reviewCount: 22,
    tags: ["luxury", "silk", "handwoven"],
    isHandmade: true,
    shippingTime: "4-6 days",
    featured: true
  },
  {
    id: "8",
    name: "Copper Water Bottle",
    description: "Traditional copper water bottle with health benefits. Handcrafted with intricate engravings and polished finish.",
    price: 1299,
    images: [copperBottle, copperBottle],
    category: "crafts",
    subcategory: "kitchenware",
    materials: ["Pure Copper"],
    dimensions: "25cm height x 8cm diameter",
    weight: "450g",
    colors: ["Copper"],
    inStock: true,
    stockCount: 18,
    artisan: {
      id: "artisan-8",
      name: "Arjun Tiwari",
      location: "Jandiala Guru, Punjab",
      bio: "Traditional coppersmith specializing in Ayurvedic vessels",
      avatar: artisanAvatar8,
      rating: 4.6,
      totalProducts: 26
    },
    rating: 4.5,
    reviewCount: 31,
    tags: ["health", "copper", "traditional"],
    isHandmade: true,
    shippingTime: "3-5 days",
    featured: false
  },
  {
    id: "9",
    name: "Ceramic Incense Holder",
    description: "Beautiful ceramic incense holder with lotus design. Perfect for meditation and aromatherapy sessions.",
    price: 599,
    images: [incenseHolder, incenseHolder],
    category: "pottery",
    subcategory: "spiritual",
    materials: ["Ceramic", "Natural Glaze"],
    dimensions: "12cm x 8cm x 3cm",
    weight: "200g",
    colors: ["Blue", "White"],
    inStock: true,
    stockCount: 30,
    artisan: {
      id: "artisan-9",
      name: "Priya Patel",
      location: "Kutch, Gujarat",
      bio: "Ceramic artist specializing in spiritual and decorative items",
      avatar: artisanAvatar9,
      rating: 4.4,
      totalProducts: 15
    },
    rating: 4.3,
    reviewCount: 19,
    tags: ["spiritual", "ceramic", "meditation"],
    isHandmade: true,
    shippingTime: "2-4 days",
    featured: false
  },
  {
    id: "10",
    name: "Jute Shopping Bag",
    description: "Eco-friendly jute shopping bag with colorful geometric patterns. Durable and sustainable alternative to plastic bags.",
    price: 399,
    images: [juteBag, juteBag],
    category: "textiles",
    subcategory: "bags",
    materials: ["Jute", "Cotton Handles"],
    dimensions: "40cm x 35cm x 15cm",
    weight: "250g",
    colors: ["Natural", "Multi-color"],
    inStock: true,
    stockCount: 45,
    artisan: {
      id: "artisan-10",
      name: "Ravi Das",
      location: "Kolkata, West Bengal",
      bio: "Jute craftsman promoting sustainable living through handwoven products",
      avatar: artisanAvatar10,
      rating: 4.2,
      totalProducts: 33
    },
    rating: 4.1,
    reviewCount: 27,
    tags: ["eco-friendly", "jute", "sustainable"],
    isHandmade: true,
    shippingTime: "2-3 days",
    featured: false
  },
  {
    id: "11",
    name: "Wooden Jewelry Box",
    description: "Handcrafted wooden jewelry box with intricate carvings and multiple compartments. Perfect for organizing precious jewelry.",
    price: 1899,
    originalPrice: 2499,
    images: [jewelryBox, jewelryBox],
    category: "crafts",
    subcategory: "storage",
    materials: ["Rosewood", "Velvet Lining"],
    dimensions: "25cm x 18cm x 12cm",
    weight: "800g",
    colors: ["Dark Brown"],
    inStock: true,
    stockCount: 12,
    artisan: {
      id: "artisan-11",
      name: "Mahesh Reddy",
      location: "Mysore, Karnataka",
      bio: "Master woodcarver specializing in decorative and functional wooden items",
      avatar: artisanAvatar11,
      rating: 4.8,
      totalProducts: 21
    },
    rating: 4.6,
    reviewCount: 16,
    tags: ["wooden", "storage", "carved"],
    isHandmade: true,
    shippingTime: "4-6 days",
    featured: true
  },
  {
    id: "12",
    name: "Traditional Tea Set",
    description: "Complete ceramic tea set with floral motifs. Includes teapot, 4 cups, and saucers in traditional Indian pottery style.",
    price: 1799,
    images: [teaSet, teaSet],
    category: "pottery",
    subcategory: "tea-sets",
    materials: ["Ceramic", "Natural Glaze"],
    dimensions: "Set of 9 pieces",
    weight: "2.2kg",
    colors: ["Blue", "White"],
    inStock: true,
    stockCount: 14,
    artisan: {
      id: "artisan-12",
      name: "Sunita Kumari",
      location: "Khurja, Uttar Pradesh",
      bio: "Traditional potter specializing in tea sets and dinnerware",
      avatar: artisanAvatar12,
      rating: 4.5,
      totalProducts: 19
    },
    rating: 4.4,
    reviewCount: 23,
    tags: ["tea-set", "ceramic", "traditional"],
    isHandmade: true,
    shippingTime: "3-5 days",
    featured: false
  },
  {
    id: "13",
    name: "Madhubani Painting",
    description: "Authentic Madhubani painting on handmade paper featuring traditional motifs. Natural colors and intricate detailing showcase the rich heritage of Mithila art.",
    price: 3499,
    originalPrice: 4299,
    images: [madhubaniPainting, madhubaniPainting],
    category: "crafts",
    subcategory: "paintings",
    materials: ["Handmade Paper", "Natural Pigments"],
    dimensions: "30cm x 40cm",
    weight: "200g",
    colors: ["Multi-color", "Traditional"],
    inStock: true,
    stockCount: 8,
    artisan: {
      id: "artisan-13",
      name: "Sunita Jha",
      location: "Madhubani, Bihar",
      bio: "Traditional Madhubani artist keeping alive the ancient art of Mithila paintings",
      avatar: artisanAvatar1,
      rating: 4.9,
      totalProducts: 16
    },
    rating: 4.7,
    reviewCount: 25,
    tags: ["traditional", "painting", "madhubani"],
    isHandmade: true,
    shippingTime: "5-7 days",
    featured: true
  },
  {
    id: "14",
    name: "Bandhani Silk Dupatta",
    description: "Traditional Bandhani tie-dye silk dupatta from Gujarat. Hand-tied and dyed using ancient techniques with vibrant colors and intricate patterns.",
    price: 2799,
    images: [bandhaniDupatta, bandhaniDupatta],
    category: "textiles",
    subcategory: "dupattas",
    materials: ["Pure Silk", "Natural Dyes"],
    dimensions: "225cm x 100cm",
    weight: "180g",
    colors: ["Red", "Yellow", "Green"],
    inStock: true,
    stockCount: 12,
    artisan: {
      id: "artisan-14",
      name: "Ramesh Khatri",
      location: "Bhuj, Gujarat",
      bio: "Master of Bandhani art with 30+ years of experience in traditional tie-dye techniques",
      avatar: artisanAvatar2,
      rating: 4.8,
      totalProducts: 27
    },
    rating: 4.6,
    reviewCount: 19,
    tags: ["bandhani", "silk", "traditional"],
    isHandmade: true,
    shippingTime: "4-6 days",
    featured: false
  },
  {
    id: "15",
    name: "Kantha Embroidered Stole",
    description: "Beautiful Kantha embroidered stole from West Bengal. Features traditional running stitch embroidery with floral motifs on soft cotton.",
    price: 1899,
    images: [kanthaStole, kanthaStole],
    category: "textiles",
    subcategory: "stoles",
    materials: ["Pure Cotton", "Silk Thread"],
    dimensions: "200cm x 70cm",
    weight: "160g",
    colors: ["Cream", "Multi-color"],
    inStock: true,
    stockCount: 16,
    artisan: {
      id: "artisan-15",
      name: "Malati Sen",
      location: "Shantiniketan, West Bengal",
      bio: "Expert in Kantha embroidery continuing the rich tradition of Bengali needlework",
      avatar: artisanAvatar3,
      rating: 4.7,
      totalProducts: 23
    },
    rating: 4.5,
    reviewCount: 14,
    tags: ["kantha", "embroidery", "bengali"],
    isHandmade: true,
    shippingTime: "3-5 days",
    featured: false
  },
  {
    id: "16",
    name: "Metal Craft Lamp",
    description: "Handcrafted metal lamp with intricate cut-work design. Creates beautiful shadow patterns when lit, perfect for ambient lighting.",
    price: 2299,
    images: [metalLamp, metalLamp],
    category: "crafts",
    subcategory: "lighting",
    materials: ["Brass", "Iron"],
    dimensions: "25cm x 25cm x 35cm",
    weight: "1.2kg",
    colors: ["Antique Brass"],
    inStock: true,
    stockCount: 10,
    artisan: {
      id: "artisan-16",
      name: "Deepak Mistri",
      location: "Rajkot, Gujarat",
      bio: "Skilled metalworker specializing in decorative brass and iron crafts",
      avatar: artisanAvatar4,
      rating: 4.6,
      totalProducts: 18
    },
    rating: 4.4,
    reviewCount: 11,
    tags: ["metal", "lighting", "decorative"],
    isHandmade: true,
    shippingTime: "5-7 days",
    featured: false
  },
  {
    id: "17",
    name: "Kalamkari Wall Hanging",
    description: "Traditional Kalamkari wall hanging with mythological scenes. Hand-painted using natural dyes on cotton fabric with intricate detailing.",
    price: 4599,
    originalPrice: 5999,
    images: [kalamkariWall, kalamkariWall],
    category: "crafts",
    subcategory: "wall-art",
    materials: ["Cotton Fabric", "Natural Dyes"],
    dimensions: "60cm x 90cm",
    weight: "300g",
    colors: ["Natural", "Earth Tones"],
    inStock: true,
    stockCount: 6,
    artisan: {
      id: "artisan-17",
      name: "Venkatesh Rao",
      location: "Srikalahasti, Andhra Pradesh",
      bio: "Traditional Kalamkari artist preserving ancient storytelling through fabric art",
      avatar: artisanAvatar5,
      rating: 4.9,
      totalProducts: 14
    },
    rating: 4.8,
    reviewCount: 17,
    tags: ["kalamkari", "wall-art", "traditional"],
    isHandmade: true,
    shippingTime: "6-8 days",
    featured: true
  },
  {
    id: "18",
    name: "Stone Inlay Coaster Set",
    description: "Set of 6 marble coasters with semi-precious stone inlay work. Features traditional Pietra Dura technique from Agra artisans.",
    price: 1599,
    images: [stoneCoasters, stoneCoasters],
    category: "crafts",
    subcategory: "tableware",
    materials: ["Marble", "Semi-precious Stones"],
    dimensions: "10cm x 10cm each",
    weight: "800g",
    colors: ["White Marble", "Multi-color"],
    inStock: true,
    stockCount: 20,
    artisan: {
      id: "artisan-18",
      name: "Abdul Rahman",
      location: "Agra, Uttar Pradesh",
      bio: "Master craftsman in Pietra Dura stone inlay work, family tradition of 4 generations",
      avatar: artisanAvatar6,
      rating: 4.7,
      totalProducts: 25
    },
    rating: 4.5,
    reviewCount: 22,
    tags: ["marble", "inlay", "tableware"],
    isHandmade: true,
    shippingTime: "4-6 days",
    featured: false
  },
  {
    id: "19",
    name: "Dhokra Art Elephant",
    description: "Traditional Dhokra metal casting elephant figurine using lost-wax technique. Beautiful tribal art piece representing good fortune and prosperity.",
    price: 2799,
    images: [dhokraElephant, dhokraElephant],
    category: "crafts",
    subcategory: "figurines",
    materials: ["Bronze", "Traditional Alloy"],
    dimensions: "20cm x 15cm x 25cm",
    weight: "1.5kg",
    colors: ["Bronze"],
    inStock: true,
    stockCount: 8,
    artisan: {
      id: "artisan-19",
      name: "Shankar Baghel",
      location: "Bastar, Chhattisgarh",
      bio: "Traditional Dhokra artist from tribal community, expert in lost-wax metal casting",
      avatar: artisanAvatar7,
      rating: 4.8,
      totalProducts: 12
    },
    rating: 4.6,
    reviewCount: 9,
    tags: ["dhokra", "tribal", "figurine"],
    isHandmade: true,
    shippingTime: "5-7 days",
    featured: true
  },
  {
    id: "20",
    name: "Ikat Handloom Saree",
    description: "Pure silk Ikat saree with traditional Odisha patterns. Hand-woven with resist-dyed threads creating beautiful geometric designs.",
    price: 8999,
    originalPrice: 11999,
    images: [ikatSaree, ikatSaree],
    category: "textiles",
    subcategory: "sarees",
    materials: ["Pure Silk", "Natural Dyes"],
    dimensions: "6.5 meters",
    weight: "500g",
    colors: ["Deep Blue", "Silver"],
    inStock: true,
    stockCount: 4,
    artisan: {
      id: "artisan-20",
      name: "Padma Mohapatra",
      location: "Sambalpur, Odisha",
      bio: "Master weaver specializing in traditional Ikat technique with 25+ years experience",
      avatar: artisanAvatar8,
      rating: 4.9,
      totalProducts: 11
    },
    rating: 4.8,
    reviewCount: 13,
    tags: ["ikat", "silk", "saree"],
    isHandmade: true,
    shippingTime: "7-10 days",
    featured: true
  }
];

export const categories = [
  { id: "pottery", name: "Pottery", count: 48 },
  { id: "textiles", name: "Textiles", count: 85 },
  { id: "crafts", name: "Crafts", count: 67 },
  { id: "jewelry", name: "Jewelry", count: 34 },
  { id: "home-decor", name: "Home Decor", count: 73 },
  { id: "paintings", name: "Paintings", count: 29 },
  { id: "lighting", name: "Lighting", count: 18 }
];

export const priceRanges = [
  { id: "under-500", label: "Under ₹500", min: 0, max: 500 },
  { id: "500-1000", label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { id: "1000-2500", label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
  { id: "2500-5000", label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { id: "above-5000", label: "Above ₹5,000", min: 5000, max: Infinity }
];

export const sortOptions = [
  { id: "newest", label: "Newest First" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
  { id: "popular", label: "Most Popular" }
];