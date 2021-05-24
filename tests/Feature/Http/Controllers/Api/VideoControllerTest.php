<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\VideoController;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Exception;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\Request;
use Mockery;
use Mockery\Mock;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class VideoControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    private $video;
    private $sendData;
    private $category;
    private $genre;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create([
            'opened' => false
        ]);
        $this->category = factory(Category::class)->create();
        $this->genre = factory(Genre::class)->create();

        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ];
    }

    public function testIndex()
    {
        $response = $this->get(route('videos.index'));

        $response->assertStatus(200)->assertJson([$this->video->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('videos.show', ['video' => $this->video->id]));

        $response->assertStatus(200)->assertJson($this->video->toArray());
    }

    public function testInvalidationRequired()
    {
        $data = [
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => '',
            'categories_id' => '',
            'genres_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax()
    {
        $data = [
            'title' => str_repeat('a', 256),
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
    }

    public function testInvalidationInteger()
    {
        $data = [
            'duration' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, 'integer');
        $this->assertInvalidationInUpdateAction($data, 'integer');
    }

    public function testInvalidationYearLaunchedField()
    {
        $data = [
            'year_launched' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationOpenedField()
    {
        $data = [
            'opened' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testInvalidationRatingField()
    {
        $data = [
            'rating' => 0,
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testInvalidationCategoriesIdField()
    {
        $data = [
            'categories_id' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id' => [1],
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testInvalidationGenresIdField()
    {
        $data = [
            'genres_id' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'genres_id' => [1],
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testStore()
    {
        $response = $this->assertStore(
            $this->sendData + ['categories_id' => [$this->category->id], 'genres_id' => [$this->genre->id]],
            $this->sendData + ['opened' => false]
        );
        $response->assertJsonStructure([
            'created_at',
            'updated_at'
        ]);

        $this->assertStore(
            $this->sendData + ['opened' => true, 'categories_id' => [$this->category->id], 'genres_id' => [$this->genre->id]],
            $this->sendData + ['opened' => true]
        );

        $this->assertStore(
            $this->sendData + ['rating' => Video::RATING_LIST[2], 'categories_id' => [$this->category->id], 'genres_id' => [$this->genre->id]],
            $this->sendData + ['rating' => Video::RATING_LIST[2]]
        );
    }

    public function testRollbackStore()
    {
        $request = Mockery::mock(Request::class);
        /** @var Mock $controller */
        $controller = Mockery::mock(VideoController::class)->makePartial()->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive("validate")
            ->withAnyArgs()
            ->andReturn($this->sendData);

        $controller
            ->shouldReceive("rulesStore")
            ->withAnyArgs()
            ->andReturn([]);

        $controller
            ->shouldReceive("handleRelations")
            ->once()
            ->andThrow(new TestException());

        try{
            $controller->store($request);
        } catch (TestException $e) {
            $this->assertCount(1, Video::all());
        }
        
    }

    public function testUpdate()
    {
        $response = $this->assertUpdate(
            $this->sendData + ['categories_id' => [$this->category->id], 'genres_id' => [$this->genre->id]],
            $this->sendData + ['opened' => false]
        );
        $response->assertJsonStructure([
            'created_at',
            'updated_at'
        ]);

        $this->assertUpdate(
            $this->sendData + ['opened' => true, 'categories_id' => [$this->category->id], 'genres_id' => [$this->genre->id]],
            $this->sendData + ['opened' => true]
        );

        $this->assertUpdate(
            $this->sendData + ['rating' => Video::RATING_LIST[2], 'categories_id' => [$this->category->id], 'genres_id' => [$this->genre->id]],
            $this->sendData + ['rating' => Video::RATING_LIST[2]]
        );
    }

    public function testDelete()
    {
        $response = $this->delete(route('videos.destroy', ['video' => $this->video->id]));
        $response->assertStatus(204);

        $this->assertNull(Video::find($this->video->id));
        $this->assertNotNull(Video::withTrashed()->find($this->video->id));
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
