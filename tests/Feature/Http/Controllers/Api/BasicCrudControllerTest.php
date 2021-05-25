<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Mockery;
use ReflectionClass;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;

class BasicCrudControllerTest extends TestCase
{
    private $controller;
    protected function setUp(): void
    {
        parent::setUp();
        CategoryStub::dropTable();
        CategoryStub::createTable();

        $this->controller = new CategoryControllerStub;
    }

    protected function tearDown(): void
    {
        CategoryStub::dropTable();
        parent::setUp();
    }

    public function testIndex()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create(['name' => 'test', 'description' => 'test']);
        $result = $this->controller->index()->toArray();
        $this->assertEquals([$category->toArray()], $result);
    }

    public function testInvalidationDataInStore()
    {
        $this->expectException(ValidationException::class);

        /** @var Request $request */
        $request = Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);

        $this->controller->store($request);
    }

    public function testStore()
    {
        /** @var Request $request */
        $request = Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test', 'description' => 'test']);

        $obj = $this->controller->store($request);
        $this->assertEquals(CategoryStub::find(1)->toArray(), $obj->toArray());
    }

    public function testIfFindOrFailFetchModel()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create(['name' => 'test', 'description' => 'test']);

        $reflectionClass = new ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $result = $reflectionMethod->invokeArgs($this->controller, [$category->id]);
        $this->assertInstanceOf(CategoryStub::class, $result);
    }

    public function testIfFindOrFailThrowExceptionWhenIdInvalid()
    {
        $this->expectException(ModelNotFoundException::class);

        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $reflectionMethod->invokeArgs($this->controller, [0]);
    }

    public function testShow()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create(['name' => 'test', 'description' => 'test']);

        $obj = $this->controller->show($category->id);
        $this->assertEquals(CategoryStub::find(1)->toArray(), $obj->toArray());
    }

    public function testUpdate()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create(['name' => 'test', 'description' => 'test']);

        $data = ['name' => 'test_modified', 'description' => 'test_modified'];

        /** @var Request $request */
        $request = Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn($data);

        $obj = $this->controller->update($request, $category->id);
        $this->assertEquals(CategoryStub::find(1)->toArray(), $obj->toArray());
    }

    public function testDelete()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create(['name' => 'test', 'description' => 'test']);

        $response = $this->controller->destroy($category->id);
        $this->createTestResponse($response)->assertStatus(204);

        $this->assertNull(CategoryStub::find($category->id));
    }
}
