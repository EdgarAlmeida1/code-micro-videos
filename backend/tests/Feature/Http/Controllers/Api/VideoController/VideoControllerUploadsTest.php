<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Http\Resources\VideoResource;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Tests\Traits\TestResources;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use TestUploads, TestValidations, TestResources;

    public function testInvalidationThumbFileField()
    {
        $this->assertInvalidationFile(
            'thumb_file',
            'jpg',
            Video::THUMB_MAX_SIZE,
            'image'
        );
    }

    public function testInvalidationBannerFileField()
    {
        $this->assertInvalidationFile(
            'banner_file',
            'jpg',
            Video::BANNER_MAX_SIZE,
            'image'
        );
    }

    public function testInvalidationTrailerFileField()
    {
        $this->assertInvalidationFile(
            'trailer_file',
            'mp4',
            Video::TRAILER_MAX_SIZE,
            'mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testInvalidationVideoFileField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            Video::VIDEO_MAX_SIZE,
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
        $this->assertFilesOnPersist($response, $files);

        $id = $response->json('data.id');
        $resource = new VideoResource(Video::find($id));
        $this->assertResource($response, $resource);
    }

    public function testUpdateWithFiles()
    {
        Storage::fake();
        $files = $this->getFiles();

        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData +
                [
                    'categories_id' => [$this->category->id],
                    'genres_id' => [$this->genre->id],
                ] +
                $files
        );

        $response->assertStatus(200);
        $this->assertFilesOnPersist($response, $files);

        $id = $response->json('data.id');
        $resource = new VideoResource(Video::find($id));
        $this->assertResource($response, $resource);

        $newFiles = [
            'thumb_file' => UploadedFile::fake()->create('thumb_file.jpg'),
            'video_file' => UploadedFile::fake()->create('video_file.mp4')
        ];

        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData +
                [
                    'categories_id' => [$this->category->id],
                    'genres_id' => [$this->genre->id],
                ] +
                $newFiles
        );
        $response->assertStatus(200);
        $this->assertFilesOnPersist($response, Arr::except($files, ['thumb_file', 'video_file']) + $newFiles);

        $id = $response->json('data.id');
        $resource = new VideoResource(Video::find($id));
        $this->assertResource($response, $resource);

        $id = $response->json('data.id');
        $video = Video::find($id);
        Storage::assertMissing($video->relativeFilePath($files['thumb_file']->hashName()));
        Storage::assertMissing($video->relativeFilePath($files['video_file']->hashName()));
    }

    protected function assertFilesOnPersist(TestResponse $response, $files)
    {
        $id = $response->json('data.id');
        $video = Video::find($id);
        $this->assertFilesExistsInStorage($video, $files);
    }

    protected function getFiles()
    {
        return [
            'thumb_file' => UploadedFile::fake()->create("thumb_file.jpg"),
            'banner_file' => UploadedFile::fake()->create("banner_file.jpg"),
            'trailer_file' => UploadedFile::fake()->create("trailer_file.mp4"),
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
