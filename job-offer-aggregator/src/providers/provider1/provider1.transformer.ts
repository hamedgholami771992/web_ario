import { Inject, Injectable } from "@nestjs/common";
import { ProviderTransformer } from "../interfaces/provider.transformer";
import { Provider1Job } from "./interfaces/provider1-api-response.interface";
import { ProviderEnum } from "../../common/enums/provider.enum";
import { Currency } from "@/currencies/currency.entity";
import { UnifiedJob } from "../../common/interfaces/unified-job.interface";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { EVENTS } from "@/common/constants/events.constants";
import { LoggerService } from "@/common/logger/logger.service";


type ParsedSalary = {
    salaryMin: number | null,
    salaryMax: number | null,
    currencySymbol: string | null,
    currencyName: string | null
}

type ParsedSalaryPart = {
    amount: number,
    symbol: string | null,
    currencyName: string | null
}



@Injectable()
export class Provider1Transformer implements ProviderTransformer<Provider1Job> {
    private cachedCurrencies: Currency[] | null
    constructor(
        @Inject("JOB_API_CLIENT")
        private readonly clientProxy: ClientProxy,
        private readonly logger: LoggerService,
    ) { }

    async onModuleInit() {
        this.logger.log(`📅 Sending: ${EVENTS.GET_CACHED_CURRENCIES} event...`);
        try {
            this.cachedCurrencies = await lastValueFrom(
              this.clientProxy.send<Currency[]>({ cmd: EVENTS.GET_CACHED_CURRENCIES }, {})
            );
            this.logger.log(`📅 Received: ${EVENTS.GET_CACHED_CURRENCIES} response...`);
        }catch(err){
            this.logger.error("error happened in getting cachedCurrencies", err)
        }
      }
    async transform(job: Provider1Job): Promise<UnifiedJob> {
        const [city, state] = job.details.location.split(',').map(s => s.trim());
        const { salaryMin, salaryMax, currencyName, currencySymbol } = this.parseSalary(job.details.salaryRange);
        const isRemote = job.title.toLowerCase().includes('remote')


        return {
            provider: ProviderEnum.PROVIDER1,
            externalId: job.jobId,
            title: job.title,
            employerName: job.company.name,
            employerIndustry: job.company.industry,
            locationCity: city,
            locationState: state,
            isRemote,
            salaryMin,
            salaryMax,
            currencyName: currencyName ? currencyName : undefined,
            currencySymbol: currencySymbol ? currencySymbol : undefined,
            skills: job.skills,
            postedAt: this.normalizePostedDate(job.postedDate),
            jobType: job.details.type,
        };
    }




    private parseSalary(input: string): ParsedSalary {
        const result: ParsedSalary = { currencyName: null, currencySymbol: null, salaryMax: null, salaryMin: null }
        if (!input) return result;

        const parts = input.split('-').map(part => part.trim());



        const first = this.parseSalaryPart(parts[0]);
        const second = parts[1] ? this.parseSalaryPart(parts[1]) : null;

        result.salaryMin = first.amount;
        result.salaryMax = second?.amount ?? first.amount; //if there is no second number, just accept the first as max
        result.currencySymbol = first.symbol;
        result.currencyName = first.currencyName;

        return result
    }

    //Input	                   Output
    // "$72k"	              {min:72000, max:72000, symbol:"$", name:null}
    // "USD 85k-100k"	{min:85000, max:100000, symbol:null, name:"USD"}
    // "€32M"	            {min:32000000, max:32000000, symbol:"€", name:null}
    // "GBP 70k - 90k"	 {min:70000, max:90000, symbol:null, name:"GBP"}
    // "100k - 120k"	  {min:100000, max:120000, symbol:null, name:null}





    private parseSalaryPart(part: string): ParsedSalaryPart {
        if (!part) return { amount: NaN, symbol: null, currencyName: null };
    
        let foundSymbol: string | null = null;
        let foundName: string | null = null;
    
        // Find currency symbol or name anywhere in the string
        for (const currency of this.cachedCurrencies ?? []) {
            const symbolRegex = new RegExp(`${currency.symbol.replace(/[$^.*+?()[\]{}|\\]/g, '\\$&')}`, 'i');
            const nameRegex = new RegExp(`\\b${currency.name}\\b`, 'i');
    
            if (currency.symbol && symbolRegex.test(part)) {
                foundSymbol = currency.symbol;
                foundName = currency.name ?? null;
                break;
            }
            if (currency.name && nameRegex.test(part)) {
                foundName = currency.name;
                foundSymbol = currency.symbol ?? null;
                break;
            }
        }
    
        // Remove any found currency symbol or name from anywhere
        if (foundSymbol) {
            const regex = new RegExp(`${foundSymbol.replace(/[$^.*+?()[\]{}|\\]/g, '\\$&')}`, 'gi');
            part = part.replace(regex, '');
        }
        if (foundName) {
            const regex = new RegExp(`\\b${foundName}\\b`, 'gi');
            part = part.replace(regex, '');
        }
    
        // Detect multiplier (k, m, etc.)
        const lastChar = part.slice(-1).toLowerCase();
        let multiplier = 1;
        if (lastChar === 'k') multiplier = 1_000;
        else if (lastChar === 'm') multiplier = 1_000_000;
    
        // Remove everything except numbers and decimal points
        const numericString = part.replace(/[^0-9.]/g, '');
        const amount = parseFloat(numericString) * multiplier;
    
        return {
            amount: isNaN(amount) ? 0 : amount,
            symbol: foundSymbol,
            currencyName: foundName
        };
    }

    private normalizePostedDate(dateValue: string): string {
        // Already in ISO string with time
        if (dateValue.includes('T')) {
          return dateValue
        }
      
        // YYYY-MM-DD (treat as midnight)
        return dateValue + 'T00:00:00Z';
    }
    
}
