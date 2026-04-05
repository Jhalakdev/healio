import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID', '');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: accountId
        ? `https://${accountId}.r2.cloudflarestorage.com`
        : 'http://localhost:9000', // fallback to local MinIO
      credentials: {
        accessKeyId: config.get<string>('R2_ACCESS_KEY_ID', 'minioadmin'),
        secretAccessKey: config.get<string>('R2_SECRET_ACCESS_KEY', 'minioadmin'),
      },
    });

    this.bucket = config.get<string>('R2_BUCKET_NAME', 'blinkcure');
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string,
  ): Promise<{ key: string; url: string }> {
    const ext = originalName.split('.').pop();
    const key = `${folder}/${uuid()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    const publicUrl = this.config.get<string>('R2_PUBLIC_URL');
    const url = publicUrl
      ? `${publicUrl}/${key}`
      : await this.getSignedUrl(key);

    return { key, url };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
