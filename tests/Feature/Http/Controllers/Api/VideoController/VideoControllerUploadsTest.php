<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use TestUploads, TestValidations;

    public function testInvalidationVideoFileField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            60,
            'mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testStoreWithFiles()
    {
        Storage::fake();
        $files = $this->getFiles();

        $response = $this->json("POST", $this->routeStore(), $this->sendData + [
            'categories_id' => [$this->category->id],
            'genres_id' => [$this->genre->id]
        ] + $files);

        $response->assertStatus(201);
        $id = $response->json("id");
        foreach ($files as $file) {
            Storage::assertExists("$id/{$file->hashName()}");
        }
    }

    public function testUpdateWithFiles()
    {
        Storage::fake();
        $files = $this->getFiles();

        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData +
                [
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id],
                ] +
                $files
        );

        $response->assertStatus(200);
        $id = $response->json("id");
        foreach ($files as $file) {
            Storage::assertExists("$id/{$file->hashName()}");
        }
    }

    protected function getFiles()
    {
        return [
            'video_file' => UploadedFile::fake()->create("video_file.mp4")
        ];
    }

    protected function routeStore()
    {
        return route('videos.store');
    }

    protected function routeUpdate()
    {
        return route('videos.update', ['video' => $this->video->id]);
    }

    protected function model()
    {
        return Video::class;
    }
}
