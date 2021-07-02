<?php

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = Category::all();
        factory(\App\Models\Genre::class, 50)->create()
            ->each(function (Genre $genre) use ($categories) {
                $categoryId = $categories->random(5)->pluck("id")->toArray();
                $genre->categories()->attach($categoryId);
            });
    }
}
