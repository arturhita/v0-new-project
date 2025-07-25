<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'operator', 'client'])->default('client');
            $table->enum('status', ['active', 'suspended', 'pending'])->default('active');
            $table->string('phone')->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->decimal('wallet_balance', 10, 2)->default(0);
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->json('specialties')->nullable();
            $table->json('availability')->nullable();
            $table->boolean('is_online')->default(false);
            $table->timestamp('last_seen')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
