<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['client', 'operator', 'admin'])->default('client');
            $table->string('avatar_url')->nullable();
            $table->text('bio')->nullable();
            $table->json('specialties')->nullable();
            $table->json('categories')->nullable();
            $table->decimal('rate_per_minute', 8, 2)->nullable();
            $table->boolean('is_available')->default(false);
            $table->boolean('is_suspended')->default(false);
            $table->decimal('wallet_balance', 10, 2)->default(0);
            $table->json('availability_schedule')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
