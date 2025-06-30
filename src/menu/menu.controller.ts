/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; // si tu utilises JWT
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuDto } from './dto/create-menu.dto';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('category')
  createCategory(@Body() categoryBody: CreateCategoryDto) {
    return this.menuService.createCategory(categoryBody);
  }

  @Get('category')
  getAllCategories() {
    return this.menuService.getAllCategories();
  }

  @Delete('category/:id')
  deleteCategory(@Param('id') id: string) {
    return this.menuService.deleteCategory(id);
  }

  @Post('item')
  createMenuItem(@Body() menuItemBody: CreateMenuDto) {
    return this.menuService.createMenuItem(menuItemBody);
  }

  @Get('item')
  getAllMenuItems() {
    return this.menuService.getAllMenuItems();
  }

  @Get('item/:id')
  getMenuItemById(@Param('id') id: string) {
    return this.menuService.getMenuItemById(id);
  }

  @Get('item/category/:categoryId')
  getMenuItemsByCategory(@Param('categoryId') categoryId: string) {
    return this.menuService.getMenuItemsByCategory(categoryId);
  }

  @Patch('item/:id')
  updateMenuItem(@Param('id') id: string, @Body() menuItemBody: CreateMenuDto) {
    return this.menuService.updateMenuItem(id, menuItemBody);
  }

  @Delete('item/:id')
  deleteMenuItem(@Param('id') id: string) {
    return this.menuService.deleteMenuItem(id);
  }
}
