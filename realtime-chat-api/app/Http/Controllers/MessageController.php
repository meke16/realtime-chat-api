<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index()
    {
        // Get the last 50 messages with the user who sent them
        return Message::with('user')->latest()->limit(50)->get()->reverse()->values();
    }

// MessageController.php

public function store(Request $request)
{
    $request->validate(['body' => 'required|string']);

    $message = $request->user()->messages()->create([
        'body' => $request->body,
    ]);

    // CHANGE THIS: Remove ->toOthers()
    broadcast(new MessageSent($message->load('user'))); 

    return $message;
}
}
