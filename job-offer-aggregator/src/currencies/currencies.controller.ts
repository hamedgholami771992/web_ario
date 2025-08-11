import { Body, Controller, HttpException, HttpStatus, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { UpdateCurrencyDto } from './dtos/update-currency.dto';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Patch(':id')
  updateCurrency(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCurrencyDto
  ) {
    return this.currenciesService.updateCurrency(id, body);
  }
}