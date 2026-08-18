
// import gồm decorator 
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
// import file service để nối với controller 
import { FeedbackService } from './feedback.service';
// import phần check tính hợp lệ của jwt 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import ft kiểm tra quyền hạn của users
import { RolesGuard } from '../auth/guards/roles.guard';
// 
import { Roles } from '../auth/decorators/roles.decorator';
// tiếp đến import usersrole từ entity user 
import { UserRole } from '../user/user.entity';

// controller cho feed backs kèm endpoint 
@Controller('api/feedbacks')
// tạo class tiện thể add export command
export class FeedbackController {

  // readonly đảm bảo đã gán giá trị thì không được gán lại nữa 
  // private thfi đảm bảo obj này chỉ được dùng trong class
  // và feedbackService ta dùng nó tương tác chính với các thành phần của service 
  private readonly feedbackService: FeedbackService;

  // hàm khởi tạo gồm tham số vào, và gán giá trị, gán cố định, k thể gán lại
  constructor(feedbackService: FeedbackService) {
    this.feedbackService = feedbackService;
  }

  // nó dùng để ánh xạ http post request vào method submitFeedback
  // hiện tại thì nó chưa có đường dẫn
  @Post()
  // hàm submit ở controller link tới service 
  // @Body là lấy phần request body, kèm theo cấu trúc kì vọng cho body 
  async submitFeedback( @Body() body: { senderName: string; senderPhone: string; content: string }) 
  {
    // return đối tượng feedbackservice , tạo feedback và gửi đi. 
    // trả về hàm tạo phản hồi, với cấu trúc của obj mà ta đã thiết lập
    // lúc này tầng service sẽ hoạt động, 
    return this.feedbackService.createFeedback(body.senderName, body.senderPhone, body.content);
  }

  // sử dụng hàng rào bảo vệ add vào gồm 2 lớp, check jwt và check role 
  @UseGuards(JwtAuthGuard, RolesGuard)
  // bắt buộc role phải là opt admin thì mới có thể pass và sử dụng được, tức là có role có jwt hợp lệ
  // mới dùng được ft này sau khi gửi request http 
  @Roles(UserRole.ADMIN)

  // đăng ký handler cho http get tại route api/feedbacks 
  @Get()
  // khi req đó tới thfi gọi method này lên 
  async getAllFeedbacks() {
    // đây là ủy quyền xử lý nnghieepj vụ cho service 
    return this.feedbackService.getAllFeedbacks();
  }
}