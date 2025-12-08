<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Auction, Product, Animal};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // <-- AÑADE ESTO


class AuctionAdminController extends Controller
{
    public function index()
    {
        // Devuelve lista paginada con relaciones
        return Auction::with('product.animal')->orderByDesc('id')->paginate(20);
    }

    public function store(Request $request)
{
    $data = $request->validate([
        'title'       => ['required','string','max:255'],
        'description' => ['nullable','string'],
        'image'       => ['nullable','image','max:2048'],
        'image_url'   => ['nullable','url'],
        'document'    => ['nullable','file','mimes:pdf'],
        'product_id'  => ['nullable','integer','exists:products,id'],
        'animal.name' => ['nullable','string','max:255'],
        'animal.species'  => ['nullable','string','max:255'],
        'animal.age'      => ['nullable','integer'],
        'animal.photo_url'=> ['nullable','string','max:1024'],
        'animal.info_url' => ['nullable','string','max:1024'],
    ]);

    // -------------------------
    // 1) Resolver PRODUCTO
    // -------------------------
    if (!empty($data['product_id'])) {
        $productId = $data['product_id'];
    } elseif (!empty($data['animal']['name'])) {
        $animal = Animal::create([
            'name'        => $data['animal']['name'],
            'species'     => $data['animal']['species'] ?? 'Perro',
            'age'         => $data['animal']['age'] ?? null,
            'photo_url'   => $data['animal']['photo_url'] ?? null,
            'info_url'    => $data['animal']['info_url'] ?? null,
        ]);

        $product = Product::create([
            'name'      => 'Pack taza + llavero ' . $animal->name,
            'animal_id' => $animal->id,
        ]);

        $productId = $product->id;
    } else {
        return response()->json([
            'message' => 'Debes elegir un producto o definir un animal'
        ], 422);
    }

    // -------------------------
    // 2) IMAGEN
    // -------------------------
    $imageUrl = null;
    if ($request->hasFile('image')) {
        $path = $request->file('image')->store('auctions', 'public');
        $imageUrl = Storage::url($path);
    } elseif (!empty($data['image_url'])) {
        $imageUrl = $data['image_url'];
    }

    // -------------------------
    // 3) PDF (SOLO GENERAR RUTA, NO ASIGNAR AUN)
    // -------------------------
    $documentUrl = null;
    if ($request->hasFile('document')) {
        $pdfPath = $request->file('document')->store('auction_docs', 'public');
        $documentUrl = Storage::url($pdfPath);
    }

    // -------------------------
    // 4) CREAR SUBASTA
    // -------------------------
    $auction = Auction::create([
        'product_id'     => $productId,
        'title'          => $data['title'],
        'description'    => $data['description'] ?? null,
        'starting_price' => 20,
        'current_price'  => 0,
        'end_at'         => null,
        'status'         => 'active',
        'image_url'      => $imageUrl,
        'document_url'   => $documentUrl, // <-- AHORA SÍ
    ]);

    return response()->json($auction->load('product.animal'), 201);
}




    public function destroy(Auction $auction)
    {
        $auction->delete();
        return response()->json(['ok' => true]);
    }

    public function close($id)
{
    $auction = Auction::findOrFail($id);

    // Obtener última puja (la mayor)
    $lastBid = $auction->bids()
        ->orderBy('amount', 'desc')
        ->first();

    if (!$lastBid) {
        return response()->json([
            "success" => false,
            "message" => "No hay pujas en esta subasta. No se puede cerrar."
        ], 400);
    }

    // Asignar ganador
    $auction->winner_user_id = $lastBid->user_id;
    $auction->winner_email = $lastBid->user->email;

    // Marcar como completada (simulamos que terminó)
    $auction->status = "completed";
    $auction->is_paid = false;
    $auction->end_at = now()->subMinute(); // ya terminó

    $auction->save();

    return response()->json([
        "success" => true,
        "message" => "Subasta cerrada correctamente",
        "winner"  => $lastBid->user->email
    ]);
}

}
