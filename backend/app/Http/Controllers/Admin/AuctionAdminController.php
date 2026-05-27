<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Product;
use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;

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

    private function publicStorageUrl(string $path): string
{
    $url = Storage::disk('public')->url($path);

    if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
        return $url;
    }

    return rtrim(config('app.url'), '/') . '/' . ltrim($url, '/');
}
    private function generateQrForAuction(Auction $auction): ?string
    {
        if (!$auction->document_url) {
            return null;
        }

        $pdfUrl = str_starts_with($auction->document_url, 'http')
    ? $auction->document_url
    : rtrim(config('app.url'), '/') . '/' . ltrim($auction->document_url, '/');
        $builder = new Builder(
            writer: new PngWriter(),
            data: $pdfUrl,
            size: 400,
            margin: 20
        );

        $result = $builder->build();

        $path = 'auction_qr/auction_' . $auction->id . '.png';

        Storage::disk('public')->put($path, $result->getString());

        return $this->publicStorageUrl($path);
    }

    public function store(Request $request)
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

        $imagePath = $request->file('image')
            ->store('auction_images', 'public');

        $imageUrl = $this->publicStorageUrl($imagePath);

        $documentPath = $request->file('document')
            ->store('auction_documents', 'public');

        $documentUrl = $this->publicStorageUrl($documentPath);

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

        $auction->qr_url = $this->generateQrForAuction($auction);
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