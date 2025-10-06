Neura Automation Bot

Giới thiệu

Neura Automation Bot là một công cụ tự động hóa được viết bằng Node.js, hỗ trợ tương tác với mạng Neura testnet và Sepolia. 

Bot cung cấp các tính năng như swap token, bridge token giữa Neura và Sepolia, claim faucet, claim pulse, claim task, và chat với validator. 

Với giao diện dòng lệnh thân thiện và hỗ trợ proxy, bot giúp người dùng tối ưu hóa các hoạt động trên blockchain một cách dễ dàng và hiệu quả.

Dự án này phù hợp cho các nhà phát triển, người thử nghiệm trên testnet, hoặc bất kỳ ai muốn tự động hóa các tác vụ liên quan đến Neura và Sepolia.

Tính năng chính:

Swap Token: Hỗ trợ swap token linh hoạt giữa các cặp token trên Neura testnet, với tùy chọn swap xuôi và ngược.

Bridge Token: Chuyển token (ANKR/tANKR) giữa Neura và Sepolia.

Claim Faucet: Tự động claim token từ faucet trên Sepolia.

Claim Pulse và Task: Tự động thu thập pulse và claim các task có sẵn để nhận điểm thưởng.

Chat với Validator: Gửi tin nhắn đến validator ngẫu nhiên trên Neura.

Hỗ trợ Proxy: Sử dụng proxy từ file proxies.txt để tăng tính ẩn danh khi gọi API.

Tự động hóa 24/7: Chạy các tác vụ theo chu kỳ 24 giờ với đồng hồ đếm ngược.

Random Delay: Sử dụng độ trễ ngẫu nhiên (10–15 giây) cho các tác vụ swap để tránh bị phát hiện.

Giao diện Logger: Cung cấp log rõ ràng với màu sắc và định dạng đẹp, hỗ trợ theo dõi tiến trình.

Yêu cầu

Node.js: Phiên bản 16.x hoặc cao hơn (đã kiểm tra với v22.14.0).

Tệp .env: Cấu hình private key của ví.

Tệp proxies.txt (tùy chọn): Danh sách proxy để sử dụng cho các yêu cầu API.

Cài đặt

Clone repository:

git clone https://github.com/wangminhei/Neuraverse-Auto-Bot.git

cd Neuraverse-Auto-Bot


Cài đặt dependencies:

npm install ethers axios fs readline dotenv https-proxy-agent siwe


Tạo tệp .env:

Tạo file .env trong thư mục gốc của dự án.

Thêm private key của ví theo định dạng sau:

PRIVATE_KEY_1=your_private_key_1

PRIVATE_KEY_2=your_private_key_2


Mỗi private key đại diện cho một ví EVM để thực hiện các tác vụ.


(Tùy chọn) Tạo tệp proxies.txt:

Tạo file proxies.txt trong thư mục gốc nếu bạn muốn sử dụng proxy.

Thêm danh sách proxy theo định dạng (mỗi proxy trên một dòng):

http://user:pass@ip:port
http://user:pass@ip:port





Cách sử dụng

Chạy bot:
node index.js


Cấu hình tham số:

Bot sẽ yêu cầu bạn nhập các tham số qua dòng lệnh:

Token để swap: Chọn số thứ tự của token FROM và TO từ danh sách token (nhập 0 để bỏ qua swap).

Số lượng swap: Nhập số lượng token để swap (ví dụ: 0.1).

Số lần swap: Nhập số lần lặp lại chu kỳ swap (ví dụ: 2).

Số lượng bridge: Nhập số lượng token để bridge từ Sepolia sang Neura và ngược lại (nhập 0 để bỏ qua).

Kích hoạt faucet: Nhập yes hoặc no để bật/tắt claim faucet.

Kích hoạt task/pulse: Nhập yes hoặc no để bật/tắt claim task, pulse, và chat với validator.


Sau khi nhập, bot sẽ chạy tự động theo chu kỳ 24 giờ.


Theo dõi log:

Bot hiển thị log chi tiết với màu sắc, bao gồm trạng thái của các tác vụ (swap, bridge, faucet, v.v.).

Các lỗi được ghi lại rõ ràng để dễ dàng debug.



Lưu ý

Testnet: Bot chỉ hoạt động trên Neura testnet và Sepolia. Đảm bảo bạn có đủ token testnet (ANKR, tANKR, ZTUSD, MOLLY) để thực hiện các tác vụ.

Gas: Đảm bảo ví của bạn có đủ ANKR trên Neura và ETH trên Sepolia để trả phí gas.

Proxy: Nếu sử dụng proxy, đảm bảo chúng hoạt động và đúng định dạng.

An toàn: Không chia sẻ private key của bạn. Chỉ sử dụng bot trên testnet để tránh rủi ro tài chính.

Donate:
Nếu bạn thấy dự án hữu ích, hãy ủng hộ tôi bằng cách donate qua các ví sau:

EVM: 0x37583df7a477aa5c41bf2754044cca554a982933

Solana: FrPT3q7LZhDFNr5KXTzLWnTP6Vs6xje8MB4Eo1ECciLN



Mọi đóng góp đều được trân trọng và giúp tôi duy trì, phát triển dự án!

Liên hệ

GitHub: wangminhei

Cộng đồng: Tham gia thảo luận Zalo https://zalo.me/g/wznoqm460 hoặc báo lỗi qua Issues

Giấy phép

Dự án được phát hành dưới MIT License.




