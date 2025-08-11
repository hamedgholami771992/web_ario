import { DataSource } from 'typeorm';
import { Currency } from '../../currencies/currency.entity';

export async function seedCurrencies(dataSource: DataSource): Promise<void> {
  const currencyRepo = dataSource.getRepository(Currency);

  const commonCurrencies: Partial<Currency>[] = [
    { name: 'USD', symbol: '$', description: "US Dollar" },
    { name: 'EUR', symbol: '€', description: "Euro"},
    { name: 'GBP', symbol: '£', description: "British Pound Sterling" },
    { name: 'JPY', symbol: '¥', description: "Japanese Yen" },
    { name: 'CNY', symbol: '¥', description: "Chinese Yuan" },
    { name: 'INR', symbol: '₹', description: "Indian Rupee" },
    { name: 'RUB', symbol: '₽', description: "Russian Ruble" },
    { name: 'CAD', symbol: 'C$', description: "Canadian Dollar" },
    { name: 'AUD', symbol: 'A$', description: "Australian Dollar" },
    { name: 'CHF', symbol: 'CHF', description: "Swiss Franc" },
    { name: 'AED', symbol: 'د.إ', description: "UAE Dirham" },
    { name: 'TRY', symbol: '₺', description: "Turkish Lira" },
    { name: 'IRR', symbol: '﷼', description: "Iranian Rial" },
    { name: 'BRL', symbol: 'R$', description: "Brazilian Real" },
    { name: 'ZAR', symbol: 'R', description: "South African Rand" },
    { name: 'SGD', symbol: 'S$', description: "Singapore Dollar"},
    { name: 'HKD', symbol: 'HK$', description: "Hong Kong Dollar"},
    { name: 'SEK', symbol: 'kr', description: "Swedish Krona"},
    { name: 'NZD', symbol: 'NZ$', description: "New Zealand Dollar"},
    { name: 'THB', symbol: '฿', description: "Thai Baht"},
    { name: 'KRW', symbol: '₩', description: "South Korean Won"},
  ];

  const existing = await currencyRepo.find();
  const existingSymbols = new Set(existing.map(c => c.symbol?.toUpperCase()));

  const toInsert = commonCurrencies.filter(c => !existingSymbols.has(c.symbol?.toUpperCase()!));

  if (toInsert.length > 0) {
    await currencyRepo.insert(toInsert);
    console.log(`✅ Inserted ${toInsert.length} new currencies.`);
  } else {
    console.log(`✅ No new currencies to insert.`);
  }
}
