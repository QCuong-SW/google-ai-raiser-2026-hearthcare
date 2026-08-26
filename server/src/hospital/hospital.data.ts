export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  isEmergency247: boolean;
  specialties: string[];
  acceptsInsurance: boolean;
  rating: number;
  userRatingsTotal: number;
  imageUrl?: string;
  workingHours: string;
}

// 100% STRICTLY INSIDE QUẬN BÌNH THẠNH ADMINISTRATIVE BOUNDARIES
export const VIETNAM_HOSPITALS: Hospital[] = [
  {
    id: "hosp-giadinh",
    name: "Bệnh viện Nhân dân Gia Định",
    address: "Số 01 Nơ Trang Long, Phường 7, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.802778,
    longitude: 106.694722,
    phone: "028 3841 2697",
    isEmergency247: true,
    specialties: ["Cấp cứu", "Tim mạch", "Đột quỵ", "Chấn thương chỉnh hình", "Nội tổng hợp", "Tiêu hóa"],
    acceptsInsurance: true,
    rating: 4.8,
    userRatingsTotal: 12800,
    imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7 (Khoa Cấp cứu)"
  },
  {
    id: "hosp-vinmec-cpr",
    name: "Bệnh viện Đa khoa Quốc tế Vinmec Central Park",
    address: "208 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.793264,
    longitude: 106.720815,
    phone: "028 3622 1166",
    isEmergency247: true,
    specialties: ["Tim mạch", "Cấp cứu 24/7", "Sản phụ khoa", "Nhi khoa", "Ung bướu", "Đột quỵ"],
    acceptsInsurance: false,
    rating: 4.9,
    userRatingsTotal: 4200,
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7"
  },
  {
    id: "hosp-ungbuou-bt",
    name: "Bệnh viện Ung Bướu TP.HCM (Cơ sở 1)",
    address: "Số 03 Nơ Trang Long, Phường 7, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.803512,
    longitude: 106.695248,
    phone: "028 3843 3022",
    isEmergency247: true,
    specialties: ["Ung bướu", "Tầm soát ung thư", "Cấp cứu", "Phẫu thuật U bướu", "Hóa trị - Xạ trị"],
    acceptsInsurance: true,
    rating: 4.7,
    userRatingsTotal: 9600,
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7 (Cấp cứu Ung bướu)"
  },
  {
    id: "hosp-quan-binhthanh",
    name: "Bệnh viện Quận Bình Thạnh",
    address: "112 Bùi Hữu Nghĩa, Phường 1, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.796541,
    longitude: 106.696839,
    phone: "028 3510 8966",
    isEmergency247: true,
    specialties: ["Đa khoa", "Cấp cứu 24/7", "Nội khoa", "Nhi khoa", "Tai Mũi Họng", "Cơ xương khớp"],
    acceptsInsurance: true,
    rating: 4.6,
    userRatingsTotal: 5400,
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7"
  },
  {
    id: "hosp-giaothongvantai",
    name: "Bệnh viện Giao Thông Vận Tải TP.HCM",
    address: "136 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.817235,
    longitude: 106.711542,
    phone: "028 3553 0303",
    isEmergency247: true,
    specialties: ["Cấp cứu", "Ngoại chấn thương", "Khám tổng quát", "Y học cổ truyền", "Nội soi"],
    acceptsInsurance: true,
    rating: 4.5,
    userRatingsTotal: 3100,
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    workingHours: "Mở cửa 24/7"
  },
  {
    id: "hosp-ttyte-binhthanh-1",
    name: "Trung tâm Y tế Quận Bình Thạnh (Cơ sở 1)",
    address: "99 Văn Cao, Phường 14, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.808215,
    longitude: 106.698532,
    phone: "028 3551 2307",
    isEmergency247: true,
    specialties: ["Y tế dự phòng", "Khám sức khỏe", "Tiêm chủng", "Nội khoa", "Nhi khoa"],
    acceptsInsurance: true,
    rating: 4.5,
    userRatingsTotal: 2200,
    workingHours: "07:30 - 17:00 (Cấp cứu trực 24/7)"
  },
  {
    id: "hosp-ttyte-binhthanh-2",
    name: "Trung tâm Y tế Quận Bình Thạnh (Cơ sở Vũ Tùng)",
    address: "04 Vũ Tùng, Phường 2, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.798214,
    longitude: 106.696125,
    phone: "028 3841 2308",
    isEmergency247: true,
    specialties: ["Y tế cộng đồng", "Cấp cứu ban đầu", "Khám Nội", "Nhi khoa"],
    acceptsInsurance: true,
    rating: 4.4,
    userRatingsTotal: 1800,
    workingHours: "07:30 - 17:00 (Cấp cứu trực 24/7)"
  },
  {
    id: "hosp-pkdk-binhthanh",
    name: "Phòng khám Đa khoa Quốc tế Bình Thạnh",
    address: "364 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.797825,
    longitude: 106.708912,
    phone: "028 3514 1122",
    isEmergency247: true,
    specialties: ["Đa khoa", "Cấp cứu 24/7", "Nhi khoa", "Tai Mũi Họng", "Xét nghiệm"],
    acceptsInsurance: true,
    rating: 4.6,
    userRatingsTotal: 2900,
    workingHours: "Mở cửa 24/7"
  }
];
