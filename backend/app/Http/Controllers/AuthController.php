<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Registro
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            // OJO: si tu frontend NO envía password_confirmation, quita "confirmed"
            'password' => ['required', Password::min(8)],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user'  => $this->userPayload($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login
     */
    public function login(Request $request)
    {
        $cred = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $cred['email'])->first();
        if (!$user || !Hash::check($cred['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userPayload($user),
        ]);
    }

    /**
     * Logout (revoca el token actual)
     */
    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['ok' => true]);
    }

    /**
     * Perfil del usuario autenticado (incluye favoritos)
     */
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    /**
     * Opcional: actualizar nombre/email/contraseña
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'     => ['sometimes','string','max:255'],
            'email'    => ['sometimes','email','max:255','unique:users,email,'.$user->id],
            'password' => ['sometimes', Password::min(8)],
        ]);

        if (isset($data['name']))     $user->name  = $data['name'];
        if (isset($data['email']))    $user->email = $data['email'];
        if (isset($data['password'])) $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    /**
     * Construye el payload consistente para el frontend
     * - incluye ids de favoritos: user.favorites -> [auction_id,...]
     * - añade is_admin si lo usas
     */
    protected function userPayload(User $user): array
    {
        // Asegúrate de tener la relación:
        // User::favorites() -> belongsToMany(Auction::class, 'favorites')
        $favoriteIds = $user->favorites()->pluck('auctions.id')->values();

        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'is_admin'   => (bool) ($user->is_admin ?? false),
            'favorites'  => $favoriteIds,
        ];
    }
}
