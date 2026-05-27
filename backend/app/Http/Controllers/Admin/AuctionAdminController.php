<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Product;
use App\Models\Auction;
use App\Services\SupabaseStorageService;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Request;

class AuctionAdminController extends Controller
{
    public function index()
    {
        $auctions = Auction::with([
            'product.animal',
            'winner',
        ])
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $auctions,
        ]);
    }

    private function generateQrForAuction(
        Auction $auction,
        SupabaseStorageService $storage
    ): ?string {
        if (!$auction->document_url) {
            return null;
        }

        $builder = new Builder(
            writer: new PngWriter(),
            data: $auction->document_url,
            size: 400,
            margin: 20
        );

        $result = $builder->build();

        $path = 'auction_qr/auction_' . $auction->id . '.png';

        return $storage->uploadContent(
            $result->getString(),
            $path,
            'image/png'
        );
    }

    public function store(Request $request, SupabaseStorageService $storage)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            'starting_price' => ['required', 'integer', 'min:1'],

            'product_name' => ['required', 'string', 'max:255'],
            'product_description' => ['nullable', 'string'],

            'image' => ['required', 'image', 'max:5120'],
            'document' => ['required', 'file', 'mimes:pdf', 'max:10240'],

            'animal.name' => ['required', 'string', 'max:255'],
            'animal.species' => ['required', 'string', 'max:255'],
        ]);

        $imageUrl = $storage->uploadUploadedFile(
            $request->file('image'),
            'auction_images'
        );

        $documentUrl = $storage->uploadUploadedFile(
            $request->file('document'),
            'auction_documents'
        );

        $animal = Animal::create([
            'name' => $data['animal']['name'],
            'species' => $data['animal']['species'],
        ]);

        $product = Product::create([
            'animal_id' => $animal->id,
            'name' => $data['product_name'],
            'description' => $data['product_description'] ?? null,
        ]);

        $auction = Auction::create([
            'product_id' => $product->id,

            'title' => $data['title'],
            'description' => $data['description'] ?? null,

            'starting_price' => (int) $data['starting_price'],
            'current_price' => 0,

            'status' => 'active',
            'end_at' => null,

            'image_url' => $imageUrl,
            'document_url' => $documentUrl,

            'qr_url' => null,
        ]);

        $auction->qr_url = $this->generateQrForAuction($auction, $storage);
        $auction->save();

        return response()->json([
            'success' => true,
            'message' => 'Subasta creada correctamente',
            'data' => $auction->fresh([
                'product.animal',
            ]),
        ], 201);
    }

    public function destroy(Auction $auction)
    {
        $auction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subasta eliminada',
        ]);
    }

    public function close($id)
    {
        $auction = Auction::with('bids.user')->findOrFail($id);

        $auction->closeNow();

        $winner = $auction->winner;

        return response()->json([
            'success' => true,
            'message' => 'Subasta cerrada correctamente',
            'winner' => $winner?->email,
        ]);
    }
}