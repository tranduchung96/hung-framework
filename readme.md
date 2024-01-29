# hung Framework

### Cách cài thư viện cho project:

- Chạy git clone https://gitlab.devsgd.com/sgd/hung-framework.git vào thư mực src/libs/hung

  ```
     git clone https://gitlab.devsgd.com/sgd/hung-framework.git ./hung/libs/hung
  ```
- Chạy npm install để cài đặt các nodejs packages từ file package.json

  ```
  npm i
  ```

## Cấu trúc thư mục của project sử dụng framework: **hung-framework**

Project chạy các modules dưới dạng các instances process nhỏ hơn. mỗi process chạy 1 hoặc nhiều nhiệm vụ lớn.

- bin: thư mục chứa các file thực thi để chạy project
- etc: thư mục chứa cấu hình
- public
- src: thưc mục chứa mã nguồn project
  - libs: Thư mục chứa các thư viện của SGD Teams hoặc các thư viện tự viết
  - modules: thư mục chứa các modules
    - commons: module chung cho toàn project
      - controllers:
        Thư mục chứa các controllers của module.
        tất cả các file controller được khai báo trong thư mục này sẽ được load tự động khi app webserver load.
        và được load trước khi load middleware và router.
        - xda: thư mục chứa các router của module xda:
          - init.js: file khởi tạo các router của module. được nạp tự động khi webserver load.
        - api: thư mục chứa các router của module api
          - init.js: file khởi tạo các router của module. được nạp tự động khi webserver load.
        - admin
          - init.js: file khởi tạo các router của module. được nạp tự động khi webserver load.
        - init.js: file khởi tạo các router của module. được nạp tự động khi webserver load.
      - middleware: Các middleware được khai báo trong thư mục này sẽ được load tự động khi webserver load.
        - xda:
          - init.js: file khởi tạo các middleware router của module. được nạp tự động khi webserver load.
        - api
          - init.js: file khởi tạo các middleware router của module. được nạp tự động khi webserver load.
        - admin
          - init.js: file khởi tạo các middleware router của module. được nạp tự động khi webserver load.
        - init.js: file khởi tạo các middleware router của module. được nạp tự động khi webserver load.
      - models
        - init.js: file khởi tạo các models của module. được nạp tự động khi app load
      - routes:  Các routers được khai báo trong thư mục này sẽ được load tự động khi webserver load.
        - xda: thư mục chứa các router của module xda:
          - init.js: file khởi tạo các router của module. được nạp tự động khi webserver load.
        - api: thư mục chứa các router của module api
          - init.js: file khởi tạo các router của module. được nạp tự động khi webserver load.
        - admin
          - init.js: file khởi tạo các router của module. được nạp tự động khi webserver load.
        - init.js: file khởi tạo các router của module. được nạp tự động khi webserver load.
      - utils
      - hooks: thư mục chứa các hooks/events của module. các hooks/events được khai báo trong thư mục này sẽ được load tự động khi app load
      - taskprocess: thư mục chứa các tiến trình chạy các nhiệm vụ của module
      - views
      - bootstrap.js: bootstrap của module. dùng để khởi động các projects, task ...
    - module_name: đây là thư mục chứa module ứng dụng. có cấu trúc như module commons

## Cấu trúc các tiến trình trong project:

A. Ứng dụng process được thiết kế chạy nhiều process, mỗi process sẽ chạy 1 hoặc nhiều nhiệm vụ, tùy từng trường hợp sử dụng. trong đó có 2 process được khởi động mặc định là:
webserver và commons process. Các process khác sẽ được khởi tạo khi cần thiết.

1. Webserver: tiến trình chạy service web.
2. commons process: đây là tiến trình xử lí các tác vụ chung chung cho toàn ứng dụng. các nhiệm vụ con có thể chạy trong process này.

**B. Các nhiệm bên trong process con sẽ sử dụng cluster hoặc wroker threads để chạy song song các nhiệm vụ.**

## Các functions đặc biệt của namespace hung
```js
hung.on('event_name', function(data){}); // đăng ký 1 event
hung.emit('event_name', data); // Emit 1 events, các events sẽ được thực thi song song vơi nhau.
hung.emitSeries('event_name', data); // Emit 1 events, các events sẽ được email tuần tự.
hung.parallel(function(){}, function(){}); // chạy song song 2 hay nhiều functions. Có thể sử dụng để tạo nhiều luồn xử lí dữ liệu/tasks
hung.go(function(){}, function(){}); // chạy song song 2 hay nhiều functions trong nextTick. Có thể sử dụng để tạo nhiều luồn xử lí dữ liệu/tasks
```

## Các biến môi trường:
- UV_THREADPOOL_SIZE: 0 = Tự động tính số threads cần thiết theo cpu cores, min là 64 luồng
- NODE_ENV: development | production
- WEB_INSTANCE: Số lượng instance webserver cần chạy. mặc định là số cpu cores