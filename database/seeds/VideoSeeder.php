<?php

use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Seeder;

class VideoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $genres = Genre::all();
        factory(\App\Models\Video::class, 100)->create()
            ->each(function (Video $video) use ($genres) {
                $subGenres = $genres->random(5)->load('categories');
                $categories = [];
                foreach ($subGenres as $genre) {
                    array_push($categories, ...$genre->categories->pluck("id")->toArray());
                }
                $categories = array_unique($categories);
                $video->categories()->attach($categories);
                $video->genres()->attach($subGenres->pluck("id")->toArray());
            });
    }
}
