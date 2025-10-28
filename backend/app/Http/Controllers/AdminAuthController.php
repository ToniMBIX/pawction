<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminAuthController extends Controller {
    public function showLogin(){
        return view('admin.login');
    }
    public function login(Request $request){
        $data = $request->validate(['email'=>'required|email','password'=>'required']);
        if(Auth::attempt(['email'=>$data['email'],'password'=>$data['password'],'is_admin'=>true], true)){
            $request->session()->regenerate();
            return redirect()->route('admin.dashboard');
        }
        return back()->withErrors(['email'=>'Credenciales inválidas o no es admin']);
    }
    public function logout(Request $request){
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('admin.login');
    }
}
