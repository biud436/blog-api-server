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
  @Assert.MaxLength(4000)
  content: string;

  @ApiProperty()
  @Assert.IsDate()
  uploadDate: Date;
}
