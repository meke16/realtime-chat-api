<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);

    // Users & presence
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/me/ping', [UserController::class, 'ping']);

    // Direct messages
    Route::get('/conversations/{user}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{user}/messages', [ConversationController::class, 'send']);
    Route::post('/messages/{message}/read', [ConversationController::class, 'markRead']);
});
