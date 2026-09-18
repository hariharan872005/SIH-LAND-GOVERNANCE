import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private endpoint: string;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY', 'minio_admin');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY', 'minio_secret_pass');
    const forcePathStyle = this.configService.get<string>('S3_FORCE_PATH_STYLE', 'true') === 'true';

    this.bucket = this.configService.get<string>('S3_BUCKET', 'gov-land-vault-prod');

    this.s3Client = new S3Client({
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

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 Bucket '${this.bucket}' verified.`);
    } catch (err) {
      try {
        this.logger.warn(`S3 Bucket '${this.bucket}' not found. Creating bucket...`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`S3 Bucket '${this.bucket}' created successfully.`);
      } catch (createErr) {
        this.logger.warn(`Could not auto-create S3 bucket: ${createErr.message}`);
      }
    }
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ storageKey: string; documentHash: string; s3Url: string }> {
    const documentHash = crypto.createHash('sha256').update(buffer).digest('hex');

    await this.ensureBucketExists();

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          Metadata: {
            sha256: documentHash,
          },
        }),
      );

      return {
        storageKey: key,
        documentHash,
        s3Url: `s3://${this.bucket}/${key}`,
      };
    } catch (err) {
      this.logger.warn(`S3 upload error: ${err.message}`);
      return {
        storageKey: key,
        documentHash,
        s3Url: `s3://${this.bucket}/${key}`,
      };
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      this.logger.log(`Deleted file from S3: ${key}`);
    } catch (err) {
      this.logger.warn(`Could not delete file from S3: ${err.message}`);
    }
  }

  async getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const isLocal =
      this.endpoint.includes('localhost') ||
      this.endpoint.includes('127.0.0.1') ||
      this.endpoint.includes('minio');

    if (isLocal) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    } catch (err) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
  }

  async getFileStream(key: string): Promise<{ stream: Readable; contentType: string; contentLength?: number }> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    return {
      stream: response.Body as Readable,
      contentType: response.ContentType || 'application/pdf',
      contentLength: response.ContentLength,
    };
  }
}
