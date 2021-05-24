<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\GenreController;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\Request;
use Mockery;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    private $genre;

    protected function setUp(): void
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('genres.index'));

        $response->assertStatus(200)->assertJson([$this->genre->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('genres.show', ['genre' => $this->genre->id]));

        $response->assertStatus(200)->assertJson($this->genre->toArray());
    }

    public function testInvalidationData()
    {
        $data = [
            'name' => '',
            'categories_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');

        $data = [
            'name' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);

        $data = [
            'is_active' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');

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

        $category = factory(Category::class)->create();
        $category->delete();
        $data = [
            'categories_id' => [$category->id],
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testStore()
    {
        $category = factory(Category::class)->create();

        $data = [
            'name' => 'test'
        ];
        $response = $this->assertStore($data + ['categories_id' => [$category->id]], $data + ['is_active' => true, 'deleted_at' => null]);

        $this->assertHasCategory($response->json("id"), $category->id);

        $data = [
            'name' => 'test',
            'is_active' => false
        ];
        $this->assertStore($data + ['categories_id' => [$category->id]], $data + ['is_active' => false]);
    }

    public function testRollbackStore()
    {
        $request = Mockery::mock(Request::class);
        /** @var Mock $controller */
        $controller = Mockery::mock(GenreController::class)->makePartial()->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive("validate")
            ->withAnyArgs()
            ->andReturn([
                "name" => "test",
            ]);

        $controller
            ->shouldReceive("rulesStore")
            ->withAnyArgs()
            ->andReturn([]);

        $controller
            ->shouldReceive("handleRelations")
            ->once()
            ->andThrow(new TestException());

        $hasError = false;
        try {
            $controller->store($request);
        } catch (TestException $e) {
            $this->assertCount(1, Genre::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    public function testUpdate()
    {
        $category = factory(Category::class)->create();

        $this->genre = factory(Genre::class)->create([
            'is_active' => false
        ]);

        $data = [
            'name' => 'test',
            'is_active' => true,
        ];
        $response = $this->assertUpdate($data + ['categories_id' => [$category->id]], $data + ['deleted_at' => null]);

        $this->assertHasCategory($response->json('id'), $category->id);
    }

    public function testRollbackUpdate()
    {
        $request = Mockery::mock(Request::class);
        /** @var Mock $controller */
        $controller = Mockery::mock(GenreController::class)->makePartial()->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive("findOrFail")
            ->withAnyArgs()
            ->andReturn($this->genre);

        $controller
            ->shouldReceive("validate")
            ->withAnyArgs()
            ->andReturn([
                "name" => "test",
            ]);

        $controller
            ->shouldReceive("rulesUpdate")
            ->withAnyArgs()
            ->andReturn([]);

        $controller
            ->shouldReceive("handleRelations")
            ->once()
            ->andThrow(new TestException());

        $hasError = false;
        try {
            $controller->update($request, 1);
        } catch (TestException $e) {
            $this->assertCount(1, Genre::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
    }

    protected function assertHasCategory($genreId, $categoryId)
    {
        $this->assertDatabaseHas("category_genre", [
            'genre_id' => $genreId,
            'category_id' => $categoryId
        ]);
    }

    public function testDelete()
    {
        $response = $this->delete(route('genres.destroy', ['genre' => $this->genre->id]));
        $response->assertStatus(204);

        $this->assertNull(Genre::find($this->genre->id));
        $this->assertNotNull(Genre::withTrashed()->find($this->genre->id));
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck("id")->toArray();

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[0]]
        ];
        $response = $this->json("POST", $this->routeStore(), $sendData);
        $this->assertDatabaseHas("category_genre", [
            "category_id" => $categoriesId[0],
            "genre_id" => $response->json("id")
        ]);


        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ];
        $response = $this->json("PUT", $this->routeUpdate(), $sendData);
        $this->assertDatabaseMissing("category_genre", [
            "category_id" => $categoriesId[0],
            "genre_id" => $response->json("id")
        ]);
        $this->assertDatabaseHas("category_genre", [
            "category_id" => $categoriesId[1],
            "genre_id" => $response->json("id")
        ]);
        $this->assertDatabaseHas("category_genre", [
            "category_id" => $categoriesId[2],
            "genre_id" => $response->json("id")
        ]);
    }

    protected function routeStore()
    {
        return route('genres.store');
    }

    protected function routeUpdate()
    {
        return route('genres.update', ['genre' => $this->genre->id]);
    }

    protected function model()
    {
        return Genre::class;
    }
}
