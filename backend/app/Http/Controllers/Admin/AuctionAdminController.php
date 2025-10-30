<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Auction, Product, Animal};
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Carbon;

class AuctionAdminController extends Controller
{
    // Lista paginada (todas)
    public function index(Request $req)
    {
        $q = Auction::with(['product.animal'])->orderByDesc('id');
        return $q->paginate(12);
    }

    // Crear subasta + (opcional) producto/animal
    public function store(Request $req)
    {
        $data = $req->validate([
            'title'           => ['required','string','max:255'],
            'description'     => ['nullable','string'],
            'image_url'       => ['nullable','url'],
            'starting_price'  => ['nullable','numeric','min:0'],
            'current_price'   => ['nullable','numeric','min:0'],
            'status'          => ['nullable', Rule::in(['active','finished','cancelled'])],
            // Si ya tienes product_id, pásalo; si no, puedes crear el pack rápido:
            'product_id'      => ['nullable','exists:products,id'],
            // atajos para crear producto/animal si no existe:
            'animal'          => ['nullable','array'],
            'animal.name'     => ['required_with:animal','string'],
            'animal.species'  => ['nullable','string'],
            'animal.age'      => ['nullable','integer'],
            'animal.photo_url'=> ['nullable','url'],
            'animal.info_url' => ['nullable','url'],
        ]);

        // Si no viene product_id pero sí animal, creamos pack "taza + llavero"
        if (empty($data['product_id']) && !empty($data['animal'])) {
            $animal = Animal::create([
                'name'       => $data['animal']['name'],
                'species'    => $data['animal']['species'] ?? 'Perro',
                'age'        => $data['animal']['age'] ?? null,
                'photo_url'  => $data['animal']['photo_url'] ?? null,
                'info_url'   => $data['animal']['info_url'] ?? null,
                'description'=> $data['animal']['description'] ?? null,
            ]);
            $product = Product::create([
                'name'      => 'Pack taza + llavero',
                'animal_id' => $animal->id,
            ]);
            $data['product_id'] = $product->id;
        }

        if (empty($data['product_id'])) {
            return response()->json(['message'=>'product_id requerido (o enviar animal para crearlo)'], 422);
        }

        // Reglas negocio:
        // - subasta arranca a 20€ cuando llegue la primera puja (end_at se fija en ese momento)
        $auction = new Auction();
        $auction->product_id     = $data['product_id'];
        $auction->title          = $data['title'];
        $auction->description    = $data['description'] ?? null;
        $auction->image_url      = $data['image_url'] ?? null;
        $auction->starting_price = $data['starting_price'] ?? 20.00;
        $auction->current_price  = $data['current_price']  ?? 0.00; // aún no ha empezado
        $auction->status         = $data['status'] ?? 'active';
        $auction->end_at         = null; // comienza con la primera puja de 20€
        $auction->save();

        return $auction->load('product.animal');
    }

    // Editar
    public function update(Request $req, Auction $auction)
    {
        $data = $req->validate([
            'title'           => ['sometimes','string','max:255'],
            'description'     => ['sometimes','nullable','string'],
            'image_url'       => ['sometimes','nullable','url'],
            'status'          => ['sometimes', Rule::in(['active','finished','cancelled'])],
            // Permite mover la fecha de cierre manualmente (opcional)
            'end_at'          => ['sometimes','nullable','date'],
        ]);

        $auction->fill($data);
        $auction->save();

        return $auction->load('product.animal');
    }

    // Borrar
    public function destroy(Auction $auction)
    {
        $auction->delete();
        return response()->json(['ok'=>true]);
    }
}
