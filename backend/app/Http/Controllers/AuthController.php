<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class AuthController extends Controller {
    public function register(Request $request){
        $data = $request->validate([
            'name'=>'required|string|max:255',
            'email'=>'required|email|unique:users,email',
            'password'=>['required', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);
        $user = User::create([
            'name'=>$data['name'],
            'email'=>$data['email'],
            'password'=>bcrypt($data['password'])
        ]);
        $token = $user->createToken('pawction')->plainTextToken;
        return response()->json(['token'=>$token, 'user'=>$user], 201);
    }

    public function login(Request $request){
        $data = $request->validate([
            'email'=>'required|email',
            'password'=>'required'
        ]);
        $user = User::where('email', $data['email'])->first();
        if(!$user || !Hash::check($data['password'], $user->password)){
            return response()->json(['message'=>'Credenciales inválidas'], 422);
        }
        $token = $user->createToken('pawction')->plainTextToken;
        return response()->json(['token'=>$token, 'user'=>$user]);
    }

    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json(['ok'=>true]);
    }
}
