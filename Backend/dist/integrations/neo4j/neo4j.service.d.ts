import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session } from 'neo4j-driver';
export interface Neo4jOwnershipChain {
    currentOwner: any;
    previousOwners: any[];
    totalTransfers: number;
    transactions: any[];
    nodes: any[];
    relationships: any[];
}
export declare class Neo4jService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private driver;
    private isConnected;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private initializeGraphSchema;
    getSession(): Session;
    createOrUpdatePerson(person: {
        id: string;
        name: string;
        panOrAadhaarHash: string;
        ownershipType?: string;
    }): Promise<any>;
    createOrUpdateLand(land: {
        landId: string;
        surveyNumber: string;
        state: string;
        district: string;
        taluk: string;
        village: string;
        areaInAcres: number;
        landType: string;
    }): Promise<any>;
    recordOwnershipTransfer(data: {
        transactionId: string;
        landId: string;
        fromOwnerId: string;
        fromOwnerName: string;
        toOwnerId: string;
        toOwnerName: string;
        toOwnerIdHash: string;
        deedNumber: string;
        registrationDate: string;
        transferType: string;
        considerationAmountINR: number;
        sroOffice: string;
    }): Promise<void>;
    getOwnershipLineage(landId: string): Promise<Neo4jOwnershipChain>;
}
