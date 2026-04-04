import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('wallet/topup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay order for wallet top-up' })
  createWalletTopup(
    @CurrentUser() user: CurrentUserData,
    @Body('amount') amount: number,
  ) {
    return this.paymentsService.createWalletTopupOrder(user.userId, amount);
  }

  @Post('plan/:planId/purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay order for plan purchase' })
  createPlanPurchase(
    @CurrentUser() user: CurrentUserData,
    @Param('planId') planId: string,
  ) {
    return this.paymentsService.createPlanPurchaseOrder(user.userId, planId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment callback' })
  verifyPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    return this.paymentsService.verifyPayment(body);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  getHistory(@CurrentUser() user: CurrentUserData) {
    return this.paymentsService.getPaymentHistory(user.userId);
  }
}
