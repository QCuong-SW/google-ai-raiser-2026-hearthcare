import {
  // khai báo thực thể bảng ánh xạ với db 
  Entity,
  //khai báo khóa chính cho bảng, và tự đọng sinh khóa chính
  PrimaryGeneratedColumn,
  // decorator ánh xạ vào cột giá trị trong bảng
  Column,
  // tạo thời gian cho cột 
  CreateDateColumn,
  // thể hiện mối quan hệ nhiều - một, nhiều feedback của 1 user 
  ManyToOne,
  // tương tự để xác định khóa ngoại, bên nào khai báo thì sẽ sở hữu relationship đó
  JoinColumn,
  // from type orm, 
} from 'typeorm';
// import thêm user entity để thực hiện tạo mối quan hệ 
import { User } from '../user/user.entity';

// khai báo decorator đây là entity ánh xạ tới bảng feedbacks
@Entity('feedbacks')
// exportclass Feedback rồi sau đó ánh xạ các thuộc tính đã khai báo
export class Feedback {
  //gồm sinh id ngẫu nhiên cho cột khóa chính sinh
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // cột name 
  // cột phone 
  // cột thông điệp
  // cột thời điểm viết 
  @Column({ name: 'sender_name' })
  senderName!: string;

  @Column({ name: 'sender_phone' })
  senderPhone!: string;

  @Column('text')
  content!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // mỗi quan hệ nhiều tới một, tức lúc này nhiều thông điệp có thể là của 1 người dùng
  // và one là user, to đến nào thfi đó chịu tracsh nhiệm
  // 
  @ManyToOne(
    // nói cho thằng typeorm hiểu rằng Feedback có mối quan hệ many với users
    () => User, 
    // lấy thuộc tính feedbacks của bên user
    (user) => user.feedbacks, 
    {
      // pkhi xóa bên users thfi cột đó được phép null 
    onDelete: 'SET NULL',
    // cho phép cột feedbacks tại user nhận giá trị null 
    nullable: true,
    }
  )
  // tạo khóa ngoại tham chiếu đến users_id của bên table user ánh xạ với entity users
  // ngoài ra dấu ! tại biến khi khái báo tức là "tạm như vầy, tao thêm giá trị sau "
  @JoinColumn({ name: 'user_id' })
  user!: User;
}