# MusikStreaming

Ứng dụng streaming nhạc được xây dựng với Next.js và TailwindCSS, theo thiết kế Material Design 3.

## Tổng quan

MusikStreaming là một ứng dụng web phát nhạc trực tuyến với các tính năng:

- Phát nhạc trực tuyến với chất lượng cao
- Quản lý thư viện cá nhân (playlist, album yêu thích)
- Tìm kiếm và khám phá nhạc mới
- Hỗ trợ đăng nhập/đăng ký tài khoản
- Giao diện người dùng theo Material Design 3
- Tương thích đa nền tảng và thiết bị

## Kiến trúc dự án

### Cấu trúc thư mục

```text
musikstreaming/
├── app/
│   ├── (auth)/           # Route xác thực người dùng
│   ├── (main)/           # Route chính của ứng dụng
│   ├── api-fetch/        # Các hàm gọi API
│   ├── components/       # Components có thể tái sử dụng
│   ├── contexts/         # React Contexts
│   ├── services/         # Business logic services
│   └── globals.css       # Styles toàn cục
```

### Kiến trúc Components

1. **Layout Components**
   - `app/(main)/layout.tsx`: Layout chính của ứng dụng
   - Quản lý bố cục và navigation chung

2. **Feature Components**
   - `content.tsx`: Component hiển thị nội dung chính
   - `dragndropzone.tsx`: Component kéo thả file
   - Các components tuỳ chỉnh Material Design 3

3. **Context Providers**
   - `media-context.tsx`: Quản lý trạng thái phát nhạc
   - Chia sẻ dữ liệu giữa các components

4. **Service Layer**
   - `auth.service.ts`: Xử lý authentication
   - `api-fetch/*.ts`: Các service gọi API

## Material Design 3 Implementation

Dự án sử dụng kết hợp giữa:

- Components tự xây dựng với TailwindCSS
- Web Components từ [@material/web](https://github.com/material-components/material-web)
- Tuỳ chỉnh theo thiết kế Material Design 3

### Custom Components

Các components được xây dựng tuân thủ:

- Tokens và biến thiết kế của Material Design 3
- Responsive design
- Accessibility standards
- Dark/Light theme support

## Hướng dẫn Phát triển

### Yêu cầu

- Node.js 18.0 hoặc cao hơn
- npm hoặc yarn

### Cài đặt

```bash
# Clone repository
git clone [repo-url]

# Cài đặt dependencies
npm install

# Chạy môi trường development
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### Scripts

Các scripts dưới đây được viết cho npm, có thể thay đổi trong [`package.json`](./package.json)

- `npm run dev`: Chạy development server
- `npm run build`: Build production
- `npm run start`: Chạy production server
- `npm run lint`: Kiểm tra linting

## Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

[MIT License](LICENSE)

## API Fetch Layer

### Album APIs

#### `album-by-id.ts`
Lấy thông tin chi tiết của một album theo ID.
- **Input**: Album ID (string)
- **Output**: AlbumDetails object
- **Chức năng**: 
  - Gọi API endpoint `/v1/collection/{id}`
  - Validate dữ liệu với Zod schema
  - Hỗ trợ 2 format response khác nhau
- **Xử lý lỗi**: Log chi tiết và throw error để component xử lý

#### `all-albums.ts`
Lấy danh sách tất cả album.
- **Input**: None
- **Output**: Array<Album>
- **Chức năng**:
  - Cache client-side (localStorage) trong 1 giờ
  - Gọi API endpoint `/albums` với pagination
  - Validate với AlbumSchema
- **Cache**: 
  - Key: "albums", "albumsTime"
  - TTL: 1 giờ

### Artist APIs

#### `all-artists.ts`
Lấy danh sách nghệ sĩ.
- **Input**: None  
- **Output**: Array<Artist>
- **Chức năng**:
  - Cache client-side
  - Gọi API endpoint `/v1/artist`
  - Validate schema với Zod

#### `artist-by-id.ts`
Lấy thông tin chi tiết nghệ sĩ.
- **Input**: Artist ID (string)
- **Output**: Artist object
- **Chức năng**:
  - Cache theo ID riêng
  - Gọi API `/v1/artist/{id}`
  - Hỗ trợ SSR và CSR
- **Cache**:
  - Key: "artist-{id}", "artistTime-{id}"
  - TTL: 1 giờ

#### `artist-id-server.ts` 
Server-side version của artist-by-id.
- **Input**: Artist ID
- **Output**: Artist object
- **Chức năng**: Tương tự artist-by-id nhưng chỉ chạy trên server

### Song APIs

#### `all-songs.ts`
Lấy danh sách bài hát.
- **Input**: None
- **Output**: Array<Song>
- **Chức năng**:
  - Cache client-side
  - Gọi API `/v1/song` với pagination
  - Validate 2 schema formats
- **Cache**:
  - Key: "songs", "songsTime" 
  - TTL: 1 giờ

#### `song-by-id.ts`
Lấy thông tin chi tiết bài hát.
- **Input**: Song ID (string)
- **Output**: SongDetails object
- **Chức năng**:
  - Cache theo ID
  - Gọi API `/v1/song/{id}`
  - Hỗ trợ SSR và CSR
- **Cache**: 
  - Key: "song-{id}", "songTime-{id}"
  - TTL: 5 phút

#### `song-id-server.ts`
Server-side version của song-by-id.
- **Input**: Song ID
- **Output**: SongDetails
- **Chức năng**: Tương tự song-by-id nhưng chỉ chạy trên server

#### `get-song.ts`
Lấy URL stream bài hát.
- **Input**: Song ID
- **Output**: {url: string}
- **Chức năng**: 
  - Gọi API `/v1/song/{id}/presigned/stream`
  - Validate URL response
  - Xử lý lỗi chi tiết

### Utility APIs

#### `cloudinary-url-processing.ts`
Xử lý URL ảnh Cloudinary.
- **Input**: 
  - url: Original URL
  - width: Desired width
  - height: Desired height  
  - type: Image category
- **Output**: Transformed Cloudinary URL
- **Chức năng**:
  - Sanitize URL
  - Generate URL với transform params
  - Optimize cho CDN delivery

### Đặc điểm chung

- **Error Handling**: 
  - Validate data với Zod schema
  - Log chi tiết lỗi
  - Clear cache khi có lỗi
  - Throw errors để component xử lý

- **Caching Strategy**:
  - Sử dụng localStorage
  - TTL khác nhau cho từng loại data
  - Clear cache tự động khi expired
  - Fallback khi cache invalid

- **Response Format**:
  - Hỗ trợ nhiều format khác nhau
  - Validate chặt chẽ với Zod
  - Transform data về unified format

- **Performance**:
  - Cache để giảm requests
  - Timeout cho requests
  - Optimize payload size
  - Support incremental loading
