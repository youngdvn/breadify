const menuItems = [
  {
    id: "banh-mi-dac-biet",
    name: "Bánh mì đặc biệt",
    description: "Pate, chả, thịt nguội, đồ chua, rau thơm và sốt nhà làm.",
    price: "32.000đ",
    badge: "Bán chạy",
    emoji: "🥖",
    detail:
      "Ổ bánh mì đầy đủ nhất của Breadify, cân bằng vị béo của pate, vị mặn của chả/thịt nguội và độ giòn chua nhẹ của đồ chua.",
    ingredients: ["Pate", "Chả lụa", "Thịt nguội", "Đồ chua", "Rau thơm"],
    calories: "420 kcal",
    prepTime: "8 phút",
  },
  {
    id: "banh-mi-ga-xe",
    name: "Bánh mì gà xé",
    description: "Gà xé mềm, dưa leo, rau thơm và sốt cay nhẹ.",
    price: "28.000đ",
    badge: "Mới",
    emoji: "🍗",
    detail:
      "Gà xé mềm được áo sốt cay nhẹ, hợp cho bữa sáng nhanh nhưng vẫn đủ vị.",
    ingredients: ["Gà xé", "Dưa leo", "Rau thơm", "Sốt cay nhẹ", "Đồ chua"],
    calories: "360 kcal",
    prepTime: "7 phút",
  },
  {
    id: "banh-mi-chay",
    name: "Bánh mì chay",
    description: "Nấm áp chảo, đậu hũ, đồ chua, rau giòn và sốt mè.",
    price: "25.000đ",
    badge: "Thanh nhẹ",
    emoji: "🌱",
    detail:
      "Phiên bản chay nhẹ bụng với nấm áp chảo và đậu hũ, giữ độ giòn đặc trưng của bánh mì.",
    ingredients: ["Nấm áp chảo", "Đậu hũ", "Đồ chua", "Rau giòn", "Sốt mè"],
    calories: "310 kcal",
    prepTime: "7 phút",
  },
  {
    id: "banh-mi-trung",
    name: "Bánh mì trứng",
    description: "Trứng ốp la lòng đào, pate, dưa leo và nước tương.",
    price: "24.000đ",
    badge: "Buổi sáng",
    emoji: "🍳",
    detail:
      "Trứng ốp la nóng, pate thơm và nước tương vừa miệng cho bữa sáng cổ điển.",
    ingredients: ["Trứng ốp la", "Pate", "Dưa leo", "Rau thơm", "Nước tương"],
    calories: "340 kcal",
    prepTime: "6 phút",
  },

  {
    id: "banh-mi-xiu-mai",
    name: "Bánh mì xíu mại",
    description: "Xíu mại sốt cà, hành lá và rau thơm.",
    price: "30.000đ",
    badge: "Hot",
    emoji: "🍅",
    detail:
      "Xíu mại mềm ngập sốt cà chua đậm vị, ăn nóng cực kỳ cuốn.",
    ingredients: ["Xíu mại", "Sốt cà", "Hành lá", "Rau thơm"],
    calories: "410 kcal",
    prepTime: "8 phút",
  },

  {
    id: "banh-mi-bo-nuong",
    name: "Bánh mì bò nướng",
    description: "Bò nướng mật ong, rau sống và sốt tiêu đen.",
    price: "39.000đ",
    badge: "Premium",
    emoji: "🥩",
    detail:
      "Thịt bò nướng thơm lừng, mềm ngọt kết hợp sốt tiêu đen đậm đà.",
    ingredients: ["Bò nướng", "Rau sống", "Sốt tiêu đen", "Dưa leo"],
    calories: "480 kcal",
    prepTime: "10 phút",
  },

  {
    id: "banh-mi-heo-quay",
    name: "Bánh mì heo quay",
    description: "Da giòn rụm, thịt heo quay và nước sốt đặc biệt.",
    price: "38.000đ",
    badge: "Đặc sản",
    emoji: "🐷",
    detail:
      "Miếng heo quay da giòn kết hợp đồ chua giúp cân bằng vị béo.",
    ingredients: ["Heo quay", "Đồ chua", "Rau thơm", "Sốt đặc biệt"],
    calories: "510 kcal",
    prepTime: "9 phút",
  },

  {
    id: "banh-mi-ca-ngu",
    name: "Bánh mì cá ngừ",
    description: "Cá ngừ trộn mayonnaise, xà lách và cà chua.",
    price: "31.000đ",
    badge: "Healthy",
    emoji: "🐟",
    detail:
      "Cá ngừ giàu protein kết hợp rau xanh tươi mát.",
    ingredients: ["Cá ngừ", "Mayonnaise", "Xà lách", "Cà chua"],
    calories: "350 kcal",
    prepTime: "6 phút",
  },

  {
    id: "banh-mi-thit-nuong",
    name: "Bánh mì thịt nướng",
    description: "Thịt nướng than hoa, đồ chua và mỡ hành.",
    price: "34.000đ",
    badge: "Best Seller",
    emoji: "🔥",
    detail:
      "Mùi thơm của thịt nướng than hoa luôn là lựa chọn khó cưỡng.",
    ingredients: ["Thịt nướng", "Đồ chua", "Mỡ hành", "Rau thơm"],
    calories: "460 kcal",
    prepTime: "8 phút",
  },

  {
    id: "banh-mi-cha-ca",
    name: "Bánh mì chả cá",
    description: "Chả cá chiên vàng, rau thơm và tương ớt.",
    price: "27.000đ",
    badge: "Phổ biến",
    emoji: "🐠",
    detail:
      "Chả cá dai mềm, thơm mùi thì là và hành lá.",
    ingredients: ["Chả cá", "Rau thơm", "Tương ớt", "Dưa leo"],
    calories: "370 kcal",
    prepTime: "7 phút",
  },

  {
    id: "banh-mi-lap-xuong",
    name: "Bánh mì lạp xưởng",
    description: "Lạp xưởng nướng, pate và sốt bơ.",
    price: "33.000đ",
    badge: "Đậm vị",
    emoji: "🌭",
    detail:
      "Lạp xưởng nướng thơm ngọt kết hợp pate béo ngậy.",
    ingredients: ["Lạp xưởng", "Pate", "Sốt bơ", "Rau thơm"],
    calories: "470 kcal",
    prepTime: "7 phút",
  },

  {
    id: "banh-mi-pho-mai",
    name: "Bánh mì phô mai tan chảy",
    description: "Phô mai mozzarella kéo sợi cùng thịt nguội.",
    price: "42.000đ",
    badge: "Premium",
    emoji: "🧀",
    detail:
      "Lớp phô mai tan chảy phủ đều tạo cảm giác béo thơm hấp dẫn.",
    ingredients: ["Mozzarella", "Thịt nguội", "Bơ tỏi", "Rau xanh"],
    calories: "520 kcal",
    prepTime: "10 phút",
  },

  {
    id: "banh-mi-hai-san",
    name: "Bánh mì hải sản",
    description: "Tôm, mực xào bơ tỏi cùng rau sống.",
    price: "45.000đ",
    badge: "Cao cấp",
    emoji: "🦐",
    detail:
      "Hải sản tươi được xào nhanh với bơ tỏi thơm nức.",
    ingredients: ["Tôm", "Mực", "Bơ tỏi", "Rau sống"],
    calories: "430 kcal",
    prepTime: "12 phút",
  },

  {
    id: "banh-mi-kebab",
    name: "Bánh mì Kebab",
    description: "Thịt nướng kiểu Thổ Nhĩ Kỳ cùng sốt yogurt.",
    price: "40.000đ",
    badge: "Quốc tế",
    emoji: "🥙",
    detail:
      "Lấy cảm hứng từ Doner Kebab với vị chua nhẹ từ sốt yogurt.",
    ingredients: ["Thịt kebab", "Bắp cải tím", "Yogurt", "Cà chua"],
    calories: "490 kcal",
    prepTime: "10 phút",
  },
];

const cartItems = [
  {
    id: "cart-1",
    name: "Bánh mì đặc biệt",
    note: "Ít cay, thêm pate",
    quantity: 2,
    price: "32.000đ",
    total: "64.000đ",
    emoji: "🥖",
  },
  {
    id: "cart-2",
    name: "Bánh mì gà xé",
    note: "Không rau răm",
    quantity: 1,
    price: "28.000đ",
    total: "28.000đ",
    emoji: "🍗",
  },
]

const orderSummary = {
  subtotal: "92.000đ",
  shipping: "10.000đ",
  discount: "-5.000đ",
  total: "97.000đ",
}

const checkoutInfo = {
  customerName: "Minh Anh",
  phone: "0901 234 567",
  address: "24 Nguyễn Trãi, Quận 1, TP.HCM",
  pickupTime: "07:45 hôm nay",
}

const paymentMethods = [
  {
    id: "cash",
    label: "Tiền mặt",
    description: "Thanh toán khi nhận bánh",
    emoji: "💵",
  },
  {
    id: "momo",
    label: "MoMo",
    description: "Quét QR để thanh toán trước",
    emoji: "🟣",
  },
]

const momoQrCells = [
  1, 1, 1, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 0, 0, 1, 1, 0, 1,
  1, 1, 1, 1, 0, 1, 1, 1, 1,
  0, 1, 0, 1, 1, 0, 0, 1, 0,
  1, 0, 1, 0, 1, 1, 1, 0, 1,
  0, 1, 1, 0, 1, 0, 1, 1, 0,
  1, 1, 1, 0, 0, 1, 1, 1, 1,
  1, 0, 1, 1, 1, 0, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 1, 1, 1,
]

const orders = [
  {
    id: "BD-2406",
    status: "Đang chuẩn bị",
    date: "Hôm nay, 07:20",
    items: "2 bánh mì đặc biệt, 1 gà xé",
    total: "97.000đ",
  },
  {
    id: "BD-2398",
    status: "Đã hoàn tất",
    date: "Hôm qua, 08:10",
    items: "1 bánh mì trứng, 1 cà phê sữa",
    total: "42.000đ",
  },
]

const account = {
  name: "Minh Anh",
  phone: "0901 234 567",
  tier: "Khách quen",
  points: 128,
  favorite: "Bánh mì đặc biệt",
  address: "24 Nguyễn Trãi, Quận 1, TP.HCM",
}

const homeDeals = [
  {
    id: "combo-sang",
    title: "Combo sáng tiết kiệm",
    description: "Bánh mì đặc biệt + cà phê sữa đá.",
    discount: "Giảm 15%",
    price: "45.000đ",
  },
  {
    id: "free-ship",
    title: "Freeship gần tiệm",
    description: "Áp dụng cho đơn từ 2 ổ trong bán kính 2km.",
    discount: "Ship 0đ",
    price: "Từ 50.000đ",
  },
]

const favoriteItems = [
  {
    id: "fav-1",
    productId: "banh-mi-dac-biet",
    name: "Bánh mì đặc biệt",
    sold: "128 lượt đặt tuần này",
    rating: "4.9",
    emoji: "🥖",
  },
  {
    id: "fav-2",
    productId: "banh-mi-ga-xe",
    name: "Bánh mì gà xé",
    sold: "86 lượt đặt tuần này",
    rating: "4.8",
    emoji: "🍗",
  },
]

const reviews = [
  {
    id: "review-1",
    customer: "Lan Anh",
    rating: "5.0",
    comment: "Bánh nóng, vỏ giòn, pate thơm. Đặt trước rất tiện.",
  },
  {
    id: "review-2",
    customer: "Quốc Huy",
    rating: "4.9",
    comment: "Gà xé vừa miệng, sốt cay nhẹ đúng gu buổi sáng.",
  },
]

export {
  account,
  cartItems,
  checkoutInfo,
  favoriteItems,
  homeDeals,
  menuItems,
  momoQrCells,
  orders,
  orderSummary,
  paymentMethods,
  reviews,
}
