<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function me(Request $req)
    {
        $u = $req->user()->load([
            'favorites:id', // solo IDs
        ]);

        // historial de pujas (bids)
        $bids = $req->user()->bids()
            ->with(['auction:id,title,current_price,end_at,status'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json([
            'user' => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            'favorites' => $user->favoriteAuctions->pluck('id'),
            ],
            'bids' => $bids,
        ]);
    }

    public function update(Request $req)
    {
        $user = $req->user();

        $data = $req->validate([
            'name' => 'nullable|string|min:2|max:100',
            'email' => ['nullable','email','max:150', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6|max:64',
        ]);

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (!empty($data['password'])) $user->password = Hash::make($data['password']);

        $user->save();

        return response()->json(['ok'=>true,'user'=>[
            'id'=>$user->id,'name'=>$user->name,'email'=>$user->email
        ]]);
    }
}
