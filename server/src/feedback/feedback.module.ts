import { Module } from '@nestjs/common';
// tạo decorator module 
// tiếp với module typeorm được khai báo để dùng các thao tác conffig
import { TypeOrmModule } from '@nestjs/typeorm';
// thêm entity của feedbacks
// thêm service và controoller
import { Feedback } from './feedback.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

// khai module kèm import là khởi tạo type orm cho feedback
@Module({
  // lấy connection đã có và đăng ký feedbackrepository vào module này 
  imports: [TypeOrmModule.forFeature([Feedback])],
  // cung cấp feedback service, nestjs hãy quản lý và tạo nó khi cần 
  // phải làm bước này thì controller mới inject được đúng k
  providers: [FeedbackService],
  // nnest js nhận diện được đây là controller xử lý http request của feedbacks
  // và lúc này các route feedback sẽ được nestjs nhận diện 
  controllers: [FeedbackController],
  // export để cho các feature khác có thể sử dụng service của feedbacks nếu cần
  exports: [FeedbackService, TypeOrmModule],
})

// và trên chỉ là thawnfng bổ sung, cũng như nên export class này ra
export class FeedbackModule {}
