<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\MessageRead;
use App\Models\User;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    protected function pairKey(int $userId, int $otherId): string
    {
        $a = min($userId, $otherId);
        $b = max($userId, $otherId);
        return "$a-$b";
    }

    public function messages(Request $request, User $user)
    {
        $authId = $request->user()->id;
        $otherId = $user->id;

        $messages = Message::with('user')
            ->where(function ($q) use ($authId, $otherId) {
                $q->where('user_id', $authId)->where('recipient_id', $otherId);
            })
            ->orWhere(function ($q) use ($authId, $otherId) {
                $q->where('user_id', $otherId)->where('recipient_id', $authId);
            })
            ->orderBy('id', 'asc')
            ->get();

        return $messages;
    }

    public function send(Request $request, User $user)
    {
        $request->validate(['body' => 'required|string']);
        $message = Message::create([
            'user_id' => $request->user()->id,
            'recipient_id' => $user->id,
            'body' => $request->body,
        ]);

        $message->load('user');
        broadcast(new MessageSent($message));

        return $message;
    }

    public function markRead(Request $request, Message $message)
    {
        MessageRead::updateOrCreate(
            [
                'message_id' => $message->id,
                'user_id' => $request->user()->id,
            ],
            [
                'read_at' => now(),
            ]
        );

        return ['ok' => true];
    }
}
