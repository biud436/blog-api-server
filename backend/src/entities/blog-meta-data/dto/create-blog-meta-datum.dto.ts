import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogMetaDatumDto {
    @ApiProperty()
    siteName?: string;

    @ApiProperty()
    githubUrl?: string;
}
