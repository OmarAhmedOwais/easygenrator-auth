import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import { EmailAlreadyTakenError } from '../../domain/email-taken.error';
import type { NewUser, User } from '../../domain/user';
import { UsersRepository } from '../../users.repository';
import { type UserDocument, UserDocumentModel } from './user.schema';

const SECRETS = '+passwordHash +refreshTokenHash';
const DUPLICATE_KEY = 11000;

@Injectable()
export class MongooseUsersRepository extends UsersRepository {
  constructor(
    @InjectModel(UserDocumentModel.name) private readonly model: Model<UserDocumentModel>,
  ) {
    super();
  }

  async create(data: NewUser): Promise<User> {
    try {
      const doc = await this.model.create(data);
      return this.toDomain(doc);
    } catch (err) {
      if ((err as { code?: number }).code === DUPLICATE_KEY) throw new EmailAlreadyTakenError();
      throw err;
    }
  }

  async findById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) return null;
    const doc = await this.model.findById(id).select(SECRETS).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // `email` is a validated string (DTO), and `$eq` pins it so an object can never become an operator.
    const doc = await this.model
      .findOne({ email: { $eq: email } })
      .select(SECRETS)
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.model.updateOne({ _id: id }, { $set: { refreshTokenHash: hash } }).exec();
  }

  async rotateRefreshTokenHash(id: string, expected: string, next: string): Promise<boolean> {
    const res = await this.model
      .updateOne({ _id: id, refreshTokenHash: expected }, { $set: { refreshTokenHash: next } })
      .exec();
    return res.modifiedCount === 1;
  }

  private toDomain(doc: UserDocument): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      passwordHash: doc.passwordHash,
      refreshTokenHash: doc.refreshTokenHash ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
