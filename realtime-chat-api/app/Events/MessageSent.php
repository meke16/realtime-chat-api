<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    /**
     * The channel the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        // If recipient_id is set, broadcast to a conversation-specific channel.
        if ($this->message->recipient_id) {
            $a = min($this->message->user_id, $this->message->recipient_id);
            $b = max($this->message->user_id, $this->message->recipient_id);
            return [new Channel("chat.dm.$a-$b")];
        }

        // Otherwise, broadcast to the public chat channel.
        return [new Channel('chat')];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
