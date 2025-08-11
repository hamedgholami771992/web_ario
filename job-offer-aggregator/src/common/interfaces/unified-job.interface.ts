import { ProviderEnum } from "../enums/provider.enum";





export interface UnifiedJob {
    provider: ProviderEnum
    externalId: string;
    title: string;
    employerName: string;
    employerWebsite?: string;       
    employerIndustry?: string;      
  
    // Location components
    locationCity?: string;
    locationState?: string;
    isRemote?: boolean;
  
    // Salary components
    salaryMin?: number;
    salaryMax?: number;
    currencyName?: string;
    currencySymbol?: string;
  
    // Job meta
    experience?: number;
    skills?: string[] | null;
    postedAt: string;         // ISO date string
    jobType?: string;   // e.g., "Full time", "Remote", etc.
  
}
  