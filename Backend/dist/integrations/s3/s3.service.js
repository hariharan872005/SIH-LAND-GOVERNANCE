"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
let S3Service = S3Service_1 = class S3Service {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(S3Service_1.name);
        this.endpoint = this.configService.get('S3_ENDPOINT', 'http://localhost:9000');
        const region = this.configService.get('S3_REGION', 'us-east-1');
        const accessKeyId = this.configService.get('S3_ACCESS_KEY', 'minio_admin');
        const secretAccessKey = this.configService.get('S3_SECRET_KEY', 'minio_secret_pass');
        const forcePathStyle = this.configService.get('S3_FORCE_PATH_STYLE', 'true') === 'true';
        this.bucket = this.configService.get('S3_BUCKET', 'gov-land-vault-prod');
        this.s3Client = new client_s3_1.S3Client({
            endpoint: this.endpoint,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            forcePathStyle,
        });
    }
    async onModuleInit() {
        await this.ensureBucketExists();
    }
    async ensureBucketExists() {
        try {
            await this.s3Client.send(new client_s3_1.HeadBucketCommand({ Bucket: this.bucket }));
            this.logger.log(`S3 Bucket '${this.bucket}' verified.`);
        }
        catch (err) {
            try {
                this.logger.warn(`S3 Bucket '${this.bucket}' not found. Creating bucket...`);
                await this.s3Client.send(new client_s3_1.CreateBucketCommand({ Bucket: this.bucket }));
                this.logger.log(`S3 Bucket '${this.bucket}' created successfully.`);
            }
            catch (createErr) {
                this.logger.warn(`Could not auto-create S3 bucket: ${createErr.message}`);
            }
        }
    }
    async uploadFile(key, buffer, mimeType) {
        const documentHash = crypto.createHash('sha256').update(buffer).digest('hex');
        await this.ensureBucketExists();
        try {
            await this.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                Metadata: {
                    sha256: documentHash,
                },
            }));
            return {
                storageKey: key,
                documentHash,
                s3Url: `s3://${this.bucket}/${key}`,
            };
        }
        catch (err) {
            this.logger.warn(`S3 upload error: ${err.message}`);
            return {
                storageKey: key,
                documentHash,
                s3Url: `s3://${this.bucket}/${key}`,
            };
        }
    }
    async deleteFile(key) {
        try {
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            this.logger.log(`Deleted file from S3: ${key}`);
        }
        catch (err) {
            this.logger.warn(`Could not delete file from S3: ${err.message}`);
        }
    }
    async getPresignedDownloadUrl(key, expiresInSeconds = 3600) {
        const isLocal = this.endpoint.includes('localhost') ||
            this.endpoint.includes('127.0.0.1') ||
            this.endpoint.includes('minio');
        if (isLocal) {
            return `${this.endpoint}/${this.bucket}/${key}`;
        }
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: expiresInSeconds });
        }
        catch (err) {
            return `${this.endpoint}/${this.bucket}/${key}`;
        }
    }
    async getFileStream(key) {
        const response = await this.s3Client.send(new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
        return {
            stream: response.Body,
            contentType: response.ContentType || 'application/pdf',
            contentLength: response.ContentLength,
        };
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map