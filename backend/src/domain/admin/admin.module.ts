import { Module } from "@nestjs/common";
import { StingerloomOrmModule } from "@stingerloom/orm/nestjs";
import { Admin } from "./admin.entity";

@Module({
    imports: [StingerloomOrmModule.forFeature([
         Admin,
    ])]
})
export class AdminModule {}