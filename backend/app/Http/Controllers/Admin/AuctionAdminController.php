<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AuctionFinishedMail;
use App\Models\Animal;
use App\Models\Auction;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuctionAdminController extends Controller
{
    public function index()
    {
        $auctions = Auction::with('product.animal')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $auctions,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            'image' => ['nullable', 'image', 'max:4096'],
            'image_url' => ['nullable', 'url'],

            'document' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'qr' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],

            'product_id' => ['nullable', 'integer', 'exists:products,id'],

            'animal.name' => ['nullable', 'string', 'max:255'],
            'animal.species' => ['nullable', 'string', 'max:255'],
            'animal.age' => ['nullable', 'integer', 'min:0'],
            'animal.photo_url' => ['nullable', 'string', 'max:1024'],
            'animal.info_url' => ['nullable', 'string', 'max:1024'],
        ]);

        // PRODUCTO
        $productId = null;

        if (!empty($data['product_id'])) {
            $productId = $data['product_id'];
        } elseif (!empty($data['animal']['name'])) {

            $animal = Animal::create([
                'name' => $data['animal']['name'],
                'species' => $data['animal']['species'] ?? 'Perro',
                'age' => $data['animal']['age'] ?? null,
                'photo_url' => $data['animal']['photo_url'] ?? null,
                'info_url' => $data['animal']['info_url'] ?? null,
            ]);

            $product = Product::create([
                'name' => 'Pack solidario ' . $animal->name,
                'animal_id' => $animal->id,
            ]);

            $productId = $product->id;
        }

        if (!$productId) {
            throw ValidationException::withMessages([
                'product_id' => [
                    'Debes seleccionar un producto o crear un animal.',
                ],
            ]);
        }

        // IMAGEN
        $imageUrl = null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')
                ->store('auctions', 'public');

            $imageUrl = Storage::url($path);
        } elseif (!empty($data['image_url'])) {
            $imageUrl = $data['image_url'];
        }

        // PDF
        $documentUrl = null;

        if ($request->hasFile('document')) {
            $pdfPath = $request->file('document')
                ->store('auction_docs', 'public');

            $documentUrl = Storage::url($pdfPath);
        }

        // QR
        $qrUrl = null;

        if ($request->hasFile('qr')) {
            $qrPath = $request->file('qr')
                ->store('auction_qr', 'public');

            $qrUrl = Storage::url($qrPath);
        }

        // CREAR
        $auction = Auction::create([
            'product_id' => $productId,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,

            'starting_price' => 20,
            'current_price' => 0,

            'status' => 'active',
            'end_at' => null,

            'image_url' => $imageUrl,
            'document_url' => $documentUrl,
            'qr_url' => $qrUrl,
        ]);

        $auction->load('product.animal');

        return response()->json([
            'success' => true,
            'message' => 'Subasta creada correctamente',
            'auction' => $auction,
        ], 201);
    }

    /**
     * SUBIR QR DESPUÉS
     */
    public function uploadQr(Request $request, $id)
    {
        $request->validate([
            'qr' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        $auction = Auction::findOrFail($id);

        $path = $request->file('qr')
            ->store('auction_qr', 'public');

        $auction->qr_url = Storage::url($path);

        $auction->save();

        return response()->json([
            'success' => true,
            'message' => 'QR subido correctamente',
            'qr_url' => $auction->qr_url,
        ]);
    }

    public function destroy(Auction $auction)
    {
        $auction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subasta eliminada correctamente',
        ]);
    }

    /**
     * CIERRE MANUAL
     */
    public function close($id)
    {
        $auction = Auction::with('bids.user')
            ->findOrFail($id);

        if ($auction->status !== 'active') {
            throw ValidationException::withMessages([
                'auction' => [
                    'La subasta ya está finalizada.',
                ],
            ]);
        }

        $lastBid = $auction->bids()
            ->orderByDesc('amount')
            ->orderByDesc('id')
            ->first();

        if (!$lastBid) {
            throw ValidationException::withMessages([
                'auction' => [
                    'No hay pujas en esta subasta.',
                ],
            ]);
        }

        $auction->winner_user_id = $lastBid->user_id;

        $auction->status = 'finished';
        $auction->is_paid = false;

        $auction->end_at = now()->subMinute();
        $auction->paid_limit_at = now()->addMinutes(5);

        $auction->save();

        try {
            Mail::to($lastBid->user->email)
                ->send(new AuctionFinishedMail($auction));
        } catch (\Throwable $e) {
            \Log::warning('Error enviando email ganador', [
                'auction_id' => $auction->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Subasta cerrada correctamente',
            'winner' => $lastBid->user->email,
        ]);
    }
}