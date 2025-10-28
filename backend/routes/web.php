<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AdminAuthController, AdminController};

Route::get('/admin/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AdminAuthController::class, 'login'])->name('admin.login.post');

Route::middleware(['web','auth','admin'])->group(function(){
    Route::post('/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
    Route::get('/admin', [AdminController::class, 'dashboard'])->name('admin.dashboard');

    Route::get('/admin/animals', [AdminController::class, 'animals'])->name('admin.animals');
    Route::get('/admin/animals/create', [AdminController::class, 'animalCreate'])->name('admin.animals.create');
    Route::post('/admin/animals', [AdminController::class, 'animalStore'])->name('admin.animals.store');
    Route::get('/admin/animals/{animal}/edit', [AdminController::class, 'animalEdit'])->name('admin.animals.edit');
    Route::post('/admin/animals/{animal}', [AdminController::class, 'animalUpdate'])->name('admin.animals.update');
    Route::delete('/admin/animals/{animal}', [AdminController::class, 'animalDelete'])->name('admin.animals.delete');

    Route::get('/admin/products', [AdminController::class, 'products'])->name('admin.products');
    Route::get('/admin/products/create', [AdminController::class, 'productCreate'])->name('admin.products.create');
    Route::post('/admin/products', [AdminController::class, 'productStore'])->name('admin.products.store');
    Route::get('/admin/products/{product}/edit', [AdminController::class, 'productEdit'])->name('admin.products.edit');
    Route::post('/admin/products/{product}', [AdminController::class, 'productUpdate'])->name('admin.products.update');
    Route::delete('/admin/products/{product}', [AdminController::class, 'productDelete'])->name('admin.products.delete');

    Route::get('/admin/auctions', [AdminController::class, 'auctions'])->name('admin.auctions');
    Route::get('/admin/auctions/create', [AdminController::class, 'auctionCreate'])->name('admin.auctions.create');
    Route::post('/admin/auctions', [AdminController::class, 'auctionStore'])->name('admin.auctions.store');
    Route::get('/admin/auctions/{auction}/edit', [AdminController::class, 'auctionEdit'])->name('admin.auctions.edit');
    Route::post('/admin/auctions/{auction}', [AdminController::class, 'auctionUpdate'])->name('admin.auctions.update');
    Route::delete('/admin/auctions/{auction}', [AdminController::class, 'auctionDelete'])->name('admin.auctions.delete');
});
