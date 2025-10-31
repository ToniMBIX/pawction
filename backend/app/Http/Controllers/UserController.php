<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id'       => $user?->id,
            'name'     => $user?->name,
            'email'    => $user?->email,
            'is_admin' => (int)($user?->is_admin ?? 0),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'     => ['sometimes','string','max:255'],
            'email'    => ['sometimes','email','max:255','unique:users,email,'.$user->id],
            'password' => ['sometimes','confirmed','min:8'],
        ]);

        if(isset($data['password'])){
            $data['password'] = \Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            'is_admin' => (int)($user->is_admin ?? 0),
        ]);
    }
}
