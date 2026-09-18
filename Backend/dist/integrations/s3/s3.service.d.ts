import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
export declare class S3Service implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private s3Client;
    private endpoint;
    private bucket;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private ensureBucketExists;
    uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<{
        storageKey: string;
        documentHash: string;
        s3Url: string;
    }>;
    deleteFile(key: string): Promise<void>;
    getPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
    getFileStream(key: string): Promise<{
        stream: Readable;
        contentType: string;
        contentLength?: number;
    }>;
}
