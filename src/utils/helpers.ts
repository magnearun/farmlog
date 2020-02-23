import { Column, ColumnOptions, getRepository } from 'typeorm';
import { Rate } from '../entities/rate';
import { Recipe } from '../entities/recipe';
import { Sheep } from '../entities/sheep';

export async function seedDatabase() {
  const recipeRepository = getRepository(Recipe);
  const sheepRepository = getRepository(Sheep);
  const ratingsRepository = getRepository(Rate);

  const recipes = recipeRepository.create([
    {
      title: 'Recipe 1',
      description: 'Desc 1',
      ratings: ratingsRepository.create([]),
    },
    {
      title: 'Recipe 2',
      ratings: ratingsRepository.create([]),
    },
  ]);

  const sheeps = sheepRepository.create([
    {
      description: 'Sheep 1',
    },
    {
      description: 'Sheep 2',
      motherId: 1,
    },
    {
      description: 'Sheep 3',
      motherId: 1,
    },
    {
      description: 'Sheep 4',
      motherId: 2,
    },
    {
      description: 'Sheep 5',
    },
  ]);
  await recipeRepository.save(recipes);
  await sheepRepository.save(sheeps);
}

export function RelationColumn(options?: ColumnOptions) {
  return Column({ nullable: true, ...options });
}
