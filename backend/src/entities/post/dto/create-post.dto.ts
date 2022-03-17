import { ApiProperty, Assert } from 'src/common/create-dto-common';

export class CreatePostDto {
  @ApiProperty()
  @Assert.IsNotEmpty('제목을 입력해주세요.')
  title: string;

  @ApiProperty()
  @Assert.IsNotEmpty('내용을 입력해주세요.')
  @Assert.MaxLength(1, {
    message: '내용을 입력해주세요.',
  })
  @Assert.MaxLength(4000, {
    message: '내용은 4000자 이내로 입력해주세요.',
  })
  content: string;

  @ApiProperty()
  uploadDate: Date;
}
