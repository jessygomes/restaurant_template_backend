/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //! GET ALL USERS
  async getUsers() {
    const users = (await this.prisma.user.findMany()) || [];
    return users;
  }

  //! GET USER BY ID
  async getUserById({ userId }: { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  //! UPDATE USER
  async updateUser({
    userId,
    userBody,
  }: {
    userId: string;
    userBody: UpdateUserDto;
  }) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        restaurantName: userBody.restaurantName,
        phone: userBody.phone,
        address: userBody.address,
        city: userBody.city,
        postalCode: userBody.postalCode,
        hours: userBody.hours,
      },
    });

    return user;
  }
}
