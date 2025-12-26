<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Direct messages: add recipient_id to messages
        Schema::table('messages', function (Blueprint $table) {
            $table->unsignedBigInteger('recipient_id')->nullable()->after('user_id');
            $table->index(['user_id', 'recipient_id']);
        });

        // Message reads
        Schema::create('message_reads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('read_at');
            $table->unique(['message_id', 'user_id']);
        });

        // Presence: last_seen_at on users
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_seen_at')->nullable()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'recipient_id']);
            $table->dropColumn('recipient_id');
        });

        Schema::dropIfExists('message_reads');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_seen_at');
        });
    }
};
