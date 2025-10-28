<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller {
    public function me(Request $request){ return response()->json($request->user()); }
    public function update(Request $request){
        $data = $request->validate(['name'=>'string','avatar_url'=>'nullable|string','bio'=>'nullable|string']);
        $u = $request->user(); $u->fill($data)->save();
        return response()->json($u);
    }
}
