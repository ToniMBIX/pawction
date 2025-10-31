<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller {
    public function me(Request $req)
{
    $u = $req->user()->loadMissing(['favorites']); // si tienes relación ->favorites()
    return response()->json([
        'id'        => $u->id,
        'name'      => $u->name,
        'email'     => $u->email,
        'is_admin'  => (bool) $u->is_admin,
        // Devuelve un array de IDs de subastas favoritas
        'favorites' => $u->favorites()->pluck('auction_id')->toArray(),
    ]);
}

    public function update(Request $request){
        $data = $request->validate(['name'=>'string','avatar_url'=>'nullable|string','bio'=>'nullable|string']);
        $u = $request->user(); $u->fill($data)->save();
        return response()->json($u);
    }
}
