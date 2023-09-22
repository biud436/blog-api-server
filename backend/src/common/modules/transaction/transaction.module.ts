import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TransactionReflectManager } from './transaction-reflect-manager';
import { TransactionService } from './transaction.service';
import { TransactionManagerConsumer } from './tx-manager.consumer';
import { TransactionQueryRunnerConsumer } from './tx-query-runner.consumer';

@Module({
    imports: [DiscoveryModule],
    providers: [
        TransactionService,
        TransactionManagerConsumer,
        TransactionQueryRunnerConsumer,
        TransactionReflectManager,
    ],
    exports: [TransactionService],
})
export class TransactionModule {}
