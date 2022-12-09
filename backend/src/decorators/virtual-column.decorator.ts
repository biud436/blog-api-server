import { applyDecorators } from '@nestjs/common';
import 'reflect-metadata';
import { Column, ColumnOptions } from 'typeorm';

export const VIRTUAL_COLUMN_KEY = Symbol('VIRTUAL_COLUMN_KEY');

/**
 * https://pietrzakadrian.com/blog/virtual-column-solutions-for-typeorm
 *
 * @param name
 * @returns
 */
export function VirtualColumn(name?: string): PropertyDecorator {
    return applyDecorators(
        Column({
            select: true,
            nullable: true,
            insert: false,
            update: false,
            name,
        }),
    );
}
