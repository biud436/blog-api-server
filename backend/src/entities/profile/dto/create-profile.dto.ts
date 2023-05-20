import { ApiProperty, Assert } from 'src/common/config/create-dto-common';

export class CreateProfileDto {
    /**
     * @maxLength 100
     */
    @ApiProperty()
    @Assert.IsNotEmpty()
    @Assert.IsString()
    @Assert.MaxLength(100)
    email!: string;

    @ApiProperty()
    @Assert.IsNotEmpty()
    nickname!: string;
}
