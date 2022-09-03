import { User } from 'src/entities/user/entities/user.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Department {
    @PrimaryGeneratedColumn({
        name: 'DEPT_SQ',
    })
    id: number;

    // 부서명
    @Column({
        name: 'DEPT_NM',
        length: 8,
    })
    name: string;

    // 상위 부서
    @Column({
        name: 'UPPER_DEPT_SQ',
        nullable: true,
    })
    upperDepartmentId: number;

    // 셀프 조인 (테스트)
    @ManyToOne(() => Department, (department) => department.departments)
    @JoinColumn({
        name: 'UPPER_DEPT_SQ',
    })
    upperDepartment: Department;

    @OneToMany(() => Department, (department) => department.upperDepartment)
    departments: Department[];

    // 부서장
    @Column({
        name: 'DEPT_MGR_SQ',
        nullable: true,
    })
    departmentManagerId: number;

    @ManyToOne(() => User, (user) => user.departments)
    @JoinColumn({
        name: 'DEPT_MGR_SQ',
    })
    departmentManager: User;

    // 부서 설명
    @Column({
        name: 'DEPT_DESC',
        nullable: true,
    })

    // 등록일
    @Column({
        name: 'REG_DT',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
    })
    registerDate: Date;

    // 수정일
    @Column({
        name: 'MOD_DT',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
    })
    modifyDate: Date;
}
