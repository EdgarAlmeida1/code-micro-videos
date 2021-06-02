<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\QueryException;

class VideoCRUDTest extends BaseVideoTestCase
{
    private $fileFields = [];

    protected function setUp(): void
    {
        parent::setUp();
        foreach (Video::$fileFields as $field) {
            $this->fileFields[$field] = "$field.test";
        }
    }

    public function testList()
    {
        factory(Video::class)->create();

        $videos = Video::all();
        $this->assertCount(1, $videos);

        $videosKeys = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id',
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration',
            'video_file',
            'thumb_file',
            'created_at',
            'updated_at',
            'deleted_at',
        ], $videosKeys);
    }

    public function testCreateWithBasicFields()
    {
        $video = Video::create($this->data + $this->fileFields);
        $video->refresh();

        $this->assertEquals(36, strlen($video->id));
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas("videos", $this->data + $this->fileFields + ['opened' => false]);

        $video = Video::create($this->data + ['opened' => true]);
        $this->assertDatabaseHas("videos", $this->data + ['opened' => true]);
    }

    public function testCreateWithRelations()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $video = Video::create($this->data + [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id]
        ]);

        $this->assertHasCategory($video->id, $category->id);
        $this->assertHasGenre($video->id, $genre->id);
    }

    public function testRollbackCreate()
    {
        $hasError = false;
        try {
            Video::create($this->data + ['categories_id' => [0]]);
        } catch (QueryException $e) {
            $this->assertCount(0, Video::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testUpdateWithBasicFields()
    {
        $video = factory(Video::class)->create(['opened' => false]);
        $video->update($this->data + $this->fileFields);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas("videos", $this->data + $this->fileFields + ['opened' => false]);

        $video = factory(Video::class)->create(['opened' => false]);
        $video->update($this->data + $this->fileFields + ['opened' => true]);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas("videos", $this->data + $this->fileFields + ['opened' => true]);
    }

    public function testUpdateWithRelations()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $video = factory(Video::class)->create();
        $video->update($this->data + [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id]
        ]);

        $this->assertHasCategory($video->id, $category->id);
        $this->assertHasGenre($video->id, $genre->id);
    }

    public function testRollbackUpdate()
    {
        $video = factory(Video::class)->create();
        $oldTitle = $video->title;

        $hasError = false;
        try {
            $video->update($this->data + ['categories_id' => [0]]);
        } catch (QueryException $e) {
            $this->assertDatabaseHas("videos", [
                'title' => $oldTitle
            ]);
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testHandleRelations()
    {
        $video = factory(Video::class)->create();
        Video::handleRelations($video, []);
        $this->assertCount(0, $video->categories);
        $this->assertCount(0, $video->genres);

        $category = factory(Category::class)->create();
        Video::handleRelations($video, ['categories_id' => $category->id]);
        $video->refresh();
        $this->assertCount(1, $video->categories);

        $genre = factory(Genre::class)->create();
        Video::handleRelations($video, ['genres_id' => $genre->id]);
        $video->refresh();
        $this->assertCount(1, $video->genres);

        $video->categories()->delete();
        $video->genres()->delete();
        Video::handleRelations($video, [
            'categories_id' => $category->id,
            'genres_id' => $genre->id
        ]);
        $video->refresh();
        $this->assertCount(1, $video->categories);
        $this->assertCount(1, $video->genres);
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck("id")->toArray();
        $video = factory(Video::class)->create();

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[0]]
        ]);
        $this->assertDatabaseHas("category_video", [
            "category_id" => $categoriesId[0],
            "video_id" => $video->id
        ]);

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ]);
        $this->assertDatabaseMissing("category_video", [
            "category_id" => $categoriesId[0],
            "video_id" => $video->id
        ]);
        $this->assertDatabaseHas("category_video", [
            "category_id" => $categoriesId[1],
            "video_id" => $video->id
        ]);
        $this->assertDatabaseHas("category_video", [
            "category_id" => $categoriesId[2],
            "video_id" => $video->id
        ]);
    }

    public function testSyncGenres()
    {
        $genresId = factory(Genre::class, 3)->create()->pluck("id")->toArray();
        $video = factory(Video::class)->create();

        Video::handleRelations($video, [
            'genres_id' => [$genresId[0]]
        ]);
        $this->assertDatabaseHas("genre_video", [
            "genre_id" => $genresId[0],
            "video_id" => $video->id
        ]);

        Video::handleRelations($video, [
            'genres_id' => [$genresId[1], $genresId[2]]
        ]);
        $this->assertDatabaseMissing("genre_video", [
            "genre_id" => $genresId[0],
            "video_id" => $video->id
        ]);
        $this->assertDatabaseHas("genre_video", [
            "genre_id" => $genresId[1],
            "video_id" => $video->id
        ]);
        $this->assertDatabaseHas("genre_video", [
            "genre_id" => $genresId[2],
            "video_id" => $video->id
        ]);
    }

    protected function assertHasCategory($videoId, $categoryId)
    {
        $this->assertDatabaseHas("category_video", [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    protected function assertHasGenre($videoId, $genreId)
    {
        $this->assertDatabaseHas("genre_video", [
            'video_id' => $videoId,
            'genre_id' => $genreId
        ]);
    }

    public function testDelete()
    {
        $video = factory(Video::class)->create();
        $video->delete();
        $this->assertNull(Video::find($video->id));

        $video->restore();
        $this->assertNotNull(Video::find($video->id));
    }
}
