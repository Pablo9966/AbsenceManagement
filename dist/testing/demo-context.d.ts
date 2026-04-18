import { IdentityAccessService } from "../application/identity-access.service.js";
import type { LocaleCode } from "../domain/types.js";
interface DemoIdentityAccessContext {
    service: IdentityAccessService;
    tenants: {
        employer: {
            tenantId: string;
            tenantName: string;
            defaultLocale: LocaleCode;
            featureFlags: string[];
        };
        internal: {
            tenantId: string;
            tenantName: string;
            defaultLocale: LocaleCode;
            featureFlags: string[];
        };
    };
    users: {
        employerAdmin: {
            userId: string;
        };
        internalClaims: {
            userId: string;
        };
        internalCompliance: {
            userId: string;
        };
    };
}
export declare const getDemoIdentityAccessContext: () => Promise<DemoIdentityAccessContext>;
export {};
