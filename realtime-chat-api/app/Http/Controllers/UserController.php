<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class UserController extends Controller
{
    public function index()
    {
        return User::select('id', 'name', 'email', 'last_seen_at')->orderBy('name')->get();
    }

    public function ping(Request $request)
    {
        $user = $request->user();
        $user->last_seen_at = now();
        $user->save();
        return ['ok' => true, 'last_seen_at' => $user->last_seen_at];
    }
}
