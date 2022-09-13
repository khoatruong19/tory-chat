import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/typeorm';
import { Services } from 'src/utils/constants';
import { compareHash, hashPassword } from 'src/utils/helpers';
import { CreateUserDetails, Tokens, UpdateUserDetails } from 'src/utils/types';
import { Not, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @Inject(Services.AUTH) private authService: AuthService,
  ) {}

  async createUser({
    email,
    firstName,
    lastName,
    password,
  }: CreateUserDetails): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new BadRequestException('This email is already exists');

    const hashedPassword = await hashPassword(password);

    const newUser = this.usersRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  async findUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: User; tokens: Tokens }> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user)
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          errors: {
            field: 'email',
            message: 'Email is invalid',
          },
        },
        HttpStatus.FORBIDDEN,
      );

    const isPasswordValid = await compareHash(password, user.password);

    if (!isPasswordValid)
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          errors: {
            field: 'password',
            message: 'Password is invalid',
          },
        },
        HttpStatus.FORBIDDEN,
      );

    const tokens = await this.authService.getTokens(user.id, user.email);

    await this.authService.updateRtHash(user.id, tokens.refresh_token);

    return {
      user,
      tokens,
    };
  }

  async me(userId: number): Promise<User> {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  async getAllUsers(userId: number): Promise<User[]> {
    return await this.usersRepository.find({
      where: {
        id: Not(userId),
      },
    });
  }

  async updateUser(value: UpdateUserDetails) {
    const existingUser = await this.usersRepository.findOne({
      where: { id: value.userId },
    });
    if (!existingUser) throw new BadRequestException('User not found!');
    if (value.email) existingUser.email = value.email;
    if (value.firstName) existingUser.firstName = value.firstName;
    if (value.lastName) existingUser.lastName = value.lastName;
    if (value.image) existingUser.image = value.image;

    await this.usersRepository.save(existingUser);

    return {
      message: 'User updated!',
    };
  }
}
