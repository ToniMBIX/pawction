<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    private function userPayload($user): array
    {
        $user->loadMissing('favorites.product.animal');

        return [
            'id' => $user->id,
            'name' => $user->name ?? '',
            'email' => $user->email ?? '',
            'is_admin' => (int) ($user->is_admin ?? 0),
            'favorites' => $user->favorites->map(function ($auction) {
                return [
                    'id' => $auction->id,
                    'title' => $auction->title,
                    'current_price' => $auction->current_price,
                    'starting_price' => $auction->starting_price,
                    'status' => $auction->status,
                    'image_url' => $auction->image_url,
                    'product' => $auction->product ? [
                        'animal' => $auction->product->animal ? [
                            'photo_url' => $auction->product->animal->photo_url,
                        ] : null,
                    ] : null,
                ];
            })->values(),
        ];
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $this->userPayload($request->user()),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'confirmed', Password::min(8)],
        ]);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if (!empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'user' => $this->userPayload($user->fresh()),
        ]);
    }
}