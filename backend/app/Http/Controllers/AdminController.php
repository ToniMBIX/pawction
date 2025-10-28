<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Animal,Product,Auction};

class AdminController extends Controller {
    public function dashboard(){
        $stats = [
            'auctions' => Auction::count(),
            'active' => Auction::where('status','active')->count(),
            'finished' => Auction::where('status','finished')->count(),
            'animals' => Animal::count()
        ];
        return view('admin.dashboard', compact('stats'));
    }

    // Animals
    public function animals(){ $items = Animal::latest()->paginate(20); return view('admin.animals.index', compact('items')); }
    public function animalCreate(){ return view('admin.animals.form', ['item'=>new Animal]); }
    public function animalStore(Request $r){
        $data = $r->validate(['name'=>'required','species'=>'nullable','age'=>'nullable|integer','description'=>'nullable','photo_url'=>'nullable','info_url'=>'nullable']);
        Animal::create($data); return redirect()->route('admin.animals')->with('ok','Creado');
    }
    public function animalEdit(Animal $animal){ return view('admin.animals.form', ['item'=>$animal]); }
    public function animalUpdate(Request $r, Animal $animal){
        $data = $r->validate(['name'=>'required','species'=>'nullable','age'=>'nullable|integer','description'=>'nullable','photo_url'=>'nullable','info_url'=>'nullable']);
        $animal->update($data); return back()->with('ok','Guardado');
    }
    public function animalDelete(Animal $animal){ $animal->delete(); return back()->with('ok','Eliminado'); }

    // Products
    public function products(){ $items = Product::with('animal')->latest()->paginate(20); return view('admin.products.index', compact('items')); }
    public function productCreate(){ return view('admin.products.form', ['item'=>new Product, 'animals'=>Animal::all()]); }
    public function productStore(Request $r){
        $data = $r->validate(['name'=>'required','animal_id'=>'required|exists:animals,id','image_url'=>'nullable']);
        Product::create($data); return redirect()->route('admin.products')->with('ok','Creado');
    }
    public function productEdit(Product $product){ return view('admin.products.form', ['item'=>$product, 'animals'=>Animal::all()]); }
    public function productUpdate(Request $r, Product $product){
        $data = $r->validate(['name'=>'required','animal_id'=>'required|exists:animals,id','image_url'=>'nullable']);
        $product->update($data); return back()->with('ok','Guardado');
    }
    public function productDelete(Product $product){ $product->delete(); return back()->with('ok','Eliminado'); }

    // Auctions
    public function auctions(){ $items = Auction::with('product.animal')->latest()->paginate(20); return view('admin.auctions.index', compact('items')); }
    public function auctionCreate(){ return view('admin.auctions.form', ['item'=>new Auction, 'products'=>Product::with('animal')->get()]); }
    public function auctionStore(Request $r){
        $data = $r->validate([
            'product_id'=>'required|exists:products,id',
            'title'=>'required','description'=>'nullable',
            'starting_price'=>'required|numeric|min:0',
            'current_price'=>'required|numeric|min:0',
            'end_at'=>'required|date',
            'status'=>'required|in:active,finished,cancelled'
        ]);
        Auction::create($data); return redirect()->route('admin.auctions')->with('ok','Creada');
    }
    public function auctionEdit(Auction $auction){ return view('admin.auctions.form', ['item'=>$auction, 'products'=>Product::with('animal')->get()]); }
    public function auctionUpdate(Request $r, Auction $auction){
        $data = $r->validate([
            'product_id'=>'required|exists:products,id',
            'title'=>'required','description'=>'nullable',
            'starting_price'=>'required|numeric|min:0',
            'current_price'=>'required|numeric|min:0',
            'end_at'=>'required|date',
            'status'=>'required|in:active,finished,cancelled'
        ]);
        $auction->update($data); return back()->with('ok','Guardada');
    }
    public function auctionDelete(Auction $auction){ $auction->delete(); return back()->with('ok','Eliminada'); }
}
