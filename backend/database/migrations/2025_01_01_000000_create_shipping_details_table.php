public function up()
{
    Schema::create('shipping_details', function (Blueprint $table) {
        $table->id();
        $table->foreignId("auction_id")->constrained()->onDelete("cascade");
        $table->foreignId("user_id")->constrained()->onDelete("cascade");
        $table->string("full_name");
        $table->string("address");
        $table->string("city");
        $table->string("province");
        $table->string("postal_code");
        $table->string("phone");
        $table->text("notes")->nullable();
        $table->timestamps();
    });
}
