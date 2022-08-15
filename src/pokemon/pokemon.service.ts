import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      return await this.pokemonModel.create(createPokemonDto);
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(): Promise<Pokemon[]> {
    return this.pokemonModel.find().exec();
  }

  async findOne(criteria: string): Promise<Pokemon> {
    // check if criteria is a ObjectId
    let objectId: string;
    isValidObjectId(criteria) ? (objectId = criteria) : null;

    // check if criteria is a number
    let code: number;
    !isNaN(+criteria) ? (code = +criteria) : null;
    // find one by id, code or name
    const pokemon = await this.pokemonModel.findOne({
      $or: [{ _id: objectId }, { code }, { name: criteria }],
    });
    // Return exception if not found
    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon not found with id, code or name: ${criteria}`,
      );
    }
    // Return pokemon if found
    return pokemon;
  }

  async update(criteria: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      // find pokemon
      const pokemon = await this.findOne(criteria);
      // return exception if not found
      if (!pokemon) {
        throw new NotFoundException(
          `Pokemon not found with id, code or name: ${criteria}`,
        );
      }
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }
      await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }

  private handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists in db: ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Error creating pokemon, please check logs`,
    );
  }
}
