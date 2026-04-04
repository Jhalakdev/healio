import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet balance' })
  getWallet(@CurrentUser() user: CurrentUserData) {
    return this.walletService.getWallet(user.userId);
  }

  @Post('add-money')
  @ApiOperation({ summary: 'Add money to wallet' })
  addMoney(
    @CurrentUser() user: CurrentUserData,
    @Body('amount') amount: number,
  ) {
    return this.walletService.addMoney(user.userId, amount);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  getTransactions(
    @CurrentUser() user: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactions(
      user.userId,
      page || 1,
      limit || 20,
    );
  }
}
