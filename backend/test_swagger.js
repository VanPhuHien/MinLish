import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

try {
  const openapiDocument = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'src', 'config', 'openapi.json'), 'utf8')
  );
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
  
  const server = app.listen(5002, async () => {
    console.log('Swagger Test Server started successfully on port 5002.');
    
    // Gửi request thử tới endpoint để xem có trả về trang HTML Swagger UI không
    try {
      const res = await fetch('http://localhost:5002/api-docs/');
      console.log('Fetch /api-docs/ status:', res.status);
      const html = await res.text();
      if (res.status === 200 && html.includes('<div id="swagger-ui">')) {
        console.log('>>> SWAGGER UI KHỞI TẠO VÀ PHỤC VỤ TRANG HTML THÀNH CÔNG (OK) <<<');
      } else {
        console.error('Lỗi: Trang HTML Swagger UI không trả về đúng định dạng mong muốn');
      }
    } catch (fetchErr) {
      console.error('Lỗi khi gửi request test:', fetchErr.message);
    } finally {
      server.close(() => {
        console.log('Đã đóng Swagger Test Server.');
        process.exit(0);
      });
    }
  });
} catch (error) {
  console.error('Lỗi phân tích cú pháp openapi.json hoặc khởi động server:', error.message);
  process.exit(1);
}
